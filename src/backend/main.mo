import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

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
  var systemInitialized : Bool = false;

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireAuthenticatedUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to perform this action. Please sign in and try again.");
    };
  };

  func autoInitializeIfNeeded(caller : Principal) {
    if (not systemInitialized and not caller.isAnonymous()) {
      if (categories.isEmpty()) {
        addDefaultCategories();
      };
      AccessControl.initialize(accessControlState, caller, "", "");
      systemInitialized := true;
    };
  };

  public shared ({ caller }) func initializeStore() : async () {
    if (systemInitialized) {
      Runtime.trap("Store already initialized");
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot initialize the store");
    };

    if (categories.isEmpty()) {
      addDefaultCategories();
    };

    AccessControl.initialize(accessControlState, caller, "", "");
    systemInitialized := true;
  };

  func addDefaultCategories() {
    let defaultCategories = [
      {
        id = "paintings";
        name = "Paintings";
        icon = "🖌️";
      },
      {
        id = "templates";
        name = "Templates";
        icon = "📄";
      },
      {
        id = "ebooks";
        name = "Ebooks";
        icon = "📚";
      },
      {
        id = "software";
        name = "Software";
        icon = "💻";
      },
      {
        id = "fashion";
        name = "Fashion";
        icon = "👗";
      },
      {
        id = "music";
        name = "Music";
        icon = "🎵";
      },
    ];
    for (category in defaultCategories.values()) {
      categories.add(category.id, category);
    };
  };

  public query func isAdminSystemInitialized() : async Bool {
    systemInitialized;
  };

  public query ({ caller }) func getCategories() : async [Category] {
    Array.fromIter(categories.values());
  };

  public query ({ caller }) func getCategory(id : Text) : async Category {
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  func ensureCategory(categoryId : Text) {
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) {};
    };
  };

  public shared ({ caller }) func createCategory(id : Text, name : Text, icon : Text) : async () {
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);

    let category : Category = {
      id;
      name;
      icon;
    };
    categories.add(id, category);
  };

  public shared ({ caller }) func createProduct(id : Text, title : Text, author : Text, priceInCents : Nat, categoryId : Text) : async () {
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);
    ensureCategory(categoryId);

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

  public shared ({ caller }) func updateProduct(
    id : Text,
    title : Text,
    author : Text,
    priceInCents : Nat,
    categoryId : Text,
  ) : async () {
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);
    let product = getProductInternal(id);
    ensureCategory(categoryId);

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
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);

    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categories.remove(id) };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public shared ({ caller }) func setProductPublished(id : Text, isPublished : Bool) : async () {
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);

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
    autoInitializeIfNeeded(caller);
    requireAdmin(caller);

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
    autoInitializeIfNeeded(caller);
    requireAuthenticatedUser(caller);

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

  public query ({ caller }) func getProduct(productId : Text) : async Product {
    let product = getProductInternal(productId);

    if (not product.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Product not found");
    };

    product;
  };

  public query ({ caller }) func listStorefrontProducts() : async ProductList {
    Array.fromIter(products.values()).filter<Product>(
      func(product) { product.isPublished }
    );
  };

  public query ({ caller }) func listStorefrontProductsByCategory(
    categoryId : Text,
  ) : async ProductList {
    Array.fromIter(products.values()).filter<Product>(
      func(product) {
        product.isPublished and product.category == categoryId;
      }
    );
  };

  public shared ({ caller }) func downloadProductFile(
    productId : Text,
  ) : async Storage.ExternalBlob {
    autoInitializeIfNeeded(caller);
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
    requireAdmin(caller);
    Array.fromIter(products.values());
  };

  public query ({ caller }) func getPurchasedProductIds() : async [Text] {
    requireAuthenticatedUser(caller);
    switch (purchases.get<Principal, Set.Set<Text>>(caller)) {
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

  public shared ({ caller }) func saveCallerUserProfile(
    userProfile : UserProfile,
  ) : async UserProfile {
    autoInitializeIfNeeded(caller);
    requireAuthenticatedUser(caller);
    userProfiles.add(caller, userProfile);
    userProfile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuthenticatedUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own profile unless you are an admin.");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    requireAdmin(caller);
    Array.fromIter(userProfiles.entries());
  };
};
