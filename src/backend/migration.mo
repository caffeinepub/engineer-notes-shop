module {
  public func run(old : { adminSystemInitialized : Bool }) : { systemInitialized : Bool } {
    { systemInitialized = old.adminSystemInitialized };
  };
};
