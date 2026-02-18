import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

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
    file : ?Storage.ExternalBlob;
    category : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type Actor = {
    accessControlState : AccessControl.AccessControlState;
    categories : Map.Map<Text, Category>;
    products : Map.Map<Text, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    purchases : Map.Map<Principal, Set.Set<Text>>;
    isInitialized : Bool;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
