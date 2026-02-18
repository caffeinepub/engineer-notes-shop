import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";

module {
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
    file : ?Blob;
    category : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    categories : Map.Map<Text, Category>;
    products : Map.Map<Text, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    purchases : Map.Map<Principal, Set.Set<Text>>;
    adminSystemInitialized : Bool;
    ownerEmail : Text;
    ownerPrincipal : ?Principal;
  };

  type NewActor = {
    categories : Map.Map<Text, Category>;
    products : Map.Map<Text, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    purchases : Map.Map<Principal, Set.Set<Text>>;
    adminSystemInitialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      categories = old.categories;
      products = old.products;
      userProfiles = old.userProfiles;
      purchases = old.purchases;
      adminSystemInitialized = old.adminSystemInitialized;
    };
  };
};
