import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Category = {
    id : Text;
    name : Text;
    icon : Text;
  };

  type Product = {
    id : Text;
    title : Text;
    author : Text;
    priceInCents : Nat;
    isPublished : Bool;
    file : ?Storage.ExternalBlob;
    category : Text;
  };

  type ProductList = [Product];

  type UserProfile = {
    name : Text;
  };

  let categories = Map.empty<Text, Category>();
  let products = Map.empty<Text, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let purchases = Map.empty<Principal, Set.Set<Text>>();

  var isInitialized = false;

  func isAdminClaimable() : Bool {
    if (not isInitialized) {
      return false;
    };
    not AccessControl.hasPermission(accessControlState, Principal.fromText("aaaaa-aa"), #admin);
  };

  public shared ({ caller }) func setAdminInitialized() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot initialize the admin system");
    };

    if (isInitialized) {
      Runtime.trap("Admin system already initialized");
    };

    isInitialized := true;
    AccessControl.initialize(accessControlState, caller, "", "");
  };

  public query func isAdminSystemInitialized() : async Bool {
    isInitialized;
  };

  public shared ({ caller }) func claimStoreOwnership() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot claim store ownership");
    };

    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };

    if (not isAdminClaimable()) {
      Runtime.trap("Store ownership already claimed. You are not authorized to claim store ownership.");
    };

    AccessControl.initialize(accessControlState, caller, "", "");
  };

  public query func isStoreClaimable() : async Bool {
    isAdminClaimable();
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray();
  };

  public query ({ caller }) func getCategory(id : Text) : async Category {
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public shared ({ caller }) func createCategory(id : Text, name : Text, icon : Text) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let category : Category = {
      id;
      name;
      icon;
    };
    categories.add(id, category);
  };

  public shared ({ caller }) func createProduct(id : Text, title : Text, author : Text, priceInCents : Nat, categoryId : Text) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    ignore getCategory(categoryId);

    let product : Product = {
      id;
      title;
      author;
      priceInCents;
      isPublished = false;
      file = null;
      category = categoryId;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func updateProduct(id : Text, title : Text, author : Text, priceInCents : Nat, categoryId : Text) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let product = getProductInternal(id);
    ignore getCategory(categoryId);

    let updatedProduct : Product = {
      id;
      title;
      author;
      priceInCents;
      isPublished = product.isPublished;
      file = product.file;
      category = categoryId;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteCategory(id : Text) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categories.remove(id) };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public shared ({ caller }) func setProductPublished(id : Text, isPublished : Bool) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
      category = product.category;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func uploadProductFile(id : Text, blob : Storage.ExternalBlob) : async () {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
      category = product.category;
    };

    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func purchaseProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to purchase products. Please sign in and try again.");
    };

    if (not isProductPublished(productId)) {
      Runtime.trap("Product is not published");
    };

    let userPurchases = switch (purchases.get(caller)) {
      case (null) { Set.empty<Text>() };
      case (?set) { set };
    };

    userPurchases.add(productId);
    purchases.add(caller, userPurchases);
  };

  public shared ({ caller }) func getProduct(productId : Text) : async Product {
    let product = getProductInternal(productId);

    if (not product.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Product not found");
    };

    product;
  };

  public query ({ caller }) func listStorefrontProducts() : async ProductList {
    products.values().toArray().filter(func(product) { product.isPublished });
  };

  public query ({ caller }) func listStorefrontProductsByCategory(categoryId : Text) : async ProductList {
    products.values().toArray().filter(
      func(product) {
        product.isPublished and product.category == categoryId;
      }
    );
  };

  public shared ({ caller }) func downloadProductFile(productId : Text) : async Storage.ExternalBlob {
    let product = getProductInternal(productId);

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let hasPurchased = switch (purchases.get(caller)) {
      case (null) { false };
      case (?userPurchases) { userPurchases.contains(productId) };
    };

    if (not isAdmin and not hasPurchased) {
      Runtime.trap("Unauthorized: You must purchase this product before downloading. Please complete your purchase and try again.");
    };

    switch (product.file) {
      case (null) { Runtime.trap("Product file not available") };
      case (?file) { file };
    };
  };

  public query ({ caller }) func getProducts() : async [Product] {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.values().toArray();
  };

  public query ({ caller }) func getPurchasedProductIds() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to view your purchases. Please sign in and try again.");
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
      Runtime.trap("Unauthorized: You must be signed in to save your profile. Please sign in and try again.");
    };
    userProfiles.add(caller, userProfile);
    userProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to view your profile. Please sign in and try again.");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own profile unless you are an admin.");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not isInitialized) {
      Runtime.trap("Admin system not initialized. Please contact the store owner to initialize the admin system.");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    userProfiles.toArray();
  };
};
