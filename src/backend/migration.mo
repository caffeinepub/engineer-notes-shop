import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type OldCategory = {
    id : Text;
    name : Text;
    icon : Text;
  };

  type OldProduct = {
    id : Text;
    title : Text;
    author : Text;
    priceInCents : Nat;
    isPublished : Bool;
    file : ?Storage.ExternalBlob;
    category : Text;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    products : Map.Map<Text, OldProduct>;
    categories : Map.Map<Text, OldCategory>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    purchases : Map.Map<Principal, Set.Set<Text>>;
    systemInitialized : Bool;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : {
    products : Map.Map<Text, OldProduct>;
    categories : Map.Map<Text, OldCategory>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    purchases : Map.Map<Principal, Set.Set<Text>>;
    systemInitialized : Bool;
    accessControlState : AccessControl.AccessControlState;
    adminPersistentState : Map.Map<Principal, Bool>;
  } {
    {
      old with
      adminPersistentState = Map.empty<Principal, Bool>()
    };
  };
};
