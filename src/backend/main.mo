import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Product = {
    id : Text;
    title : Text;
    author : Text;
    priceInCents : Nat;
    isPublished : Bool;
    file : ?Storage.ExternalBlob;
  };

  public type Purchase = {
    user : Principal;
    productId : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let purchases = Map.empty<Principal, Set.Set<Text>>();

  type ProductList = [Product];

  public shared ({ caller }) func createProduct(id : Text, title : Text, author : Text, priceInCents : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product : Product = {
      id;
      title;
      author;
      priceInCents;
      isPublished = false;
      file = null;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func updateProduct(id : Text, title : Text, author : Text, priceInCents : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product = getProductInternal(id);
    let updatedProduct : Product = {
      id;
      title;
      author;
      priceInCents;
      isPublished = product.isPublished;
      file = product.file;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public shared ({ caller }) func setProductPublished(id : Text, isPublished : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product = getProductInternal(id);
    let updatedProduct : Product = {
      id = product.id;
      title = product.title;
      author = product.author;
      priceInCents = product.priceInCents;
      isPublished;
      file = product.file;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func uploadProductFile(id : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product = getProductInternal(id);
    let updatedProduct : Product = {
      id = product.id;
      title = product.title;
      author = product.author;
      priceInCents = product.priceInCents;
      isPublished = product.isPublished;
      file = ?blob;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func purchaseProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can purchase products");
    };

    if (not isProductPublished(productId)) {
      Runtime.trap("Product is not published");
    };

    // Record the purchase
    let userPurchases = switch (purchases.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?set) { set };
    };

    userPurchases.add(productId);
    purchases.add(caller, userPurchases);
  };

  public shared ({ caller }) func getProduct(productId : Text) : async Product {
    let product = getProductInternal(productId);

    // Unpublished products are only visible to admins
    if (not product.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Product not found");
    };

    product;
  };

  public query ({ caller }) func listStorefrontProducts() : async ProductList {
    products.values().toArray().filter(
      func(product) { product.isPublished }
    );
  };

  public shared ({ caller }) func downloadProductFile(productId : Text) : async Storage.ExternalBlob {
    let product = getProductInternal(productId);

    // Check if user is admin or has purchased the product
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let hasPurchased = switch (purchases.get(caller)) {
      case (null) { false };
      case (?userPurchases) { userPurchases.contains(productId) };
    };

    if (not isAdmin and not hasPurchased) {
      Runtime.trap("Unauthorized: Must purchase product to download");
    };

    switch (product.file) {
      case (null) { Runtime.trap("Product file not available") };
      case (?file) { file };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.values().toArray();
  };

  public query ({ caller }) func getPurchasedProductIds() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view purchases");
    };

    switch (purchases.get(caller)) {
      case (null) { [] };
      case (?userPurchases) { userPurchases.toArray() };
    };
  };

  func isProductPublished(productId : Text) : Bool {
    switch (products.get(productId)) {
      case (null) { false };
      case (?product) { product.isPublished };
    };
  };

  func getProductInternal(productId : Text) : Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(userProfile : UserProfile) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, userProfile);
    userProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles.toArray();
  };
};
