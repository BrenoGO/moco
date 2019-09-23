const helpers = {
  getChildren: (accounts, id) => {
    const children = accounts.filter(
      ac => (ac.parents[ac.parents.length - 1] === id)
    ).sort((a, b) => (a.id - b.id));
    return children;
  },
  organizedAccounts: (accounts, id) => {
    const rootAccs = helpers.getChildren(accounts, id);
    const orgAc = [];

    function loopChildren(children) {
      if (children.length > 0) {
        children.forEach((child) => {
          orgAc.push(child);
          loopChildren(helpers.getChildren(accounts, child.id));
        });
      }
    }
    loopChildren(rootAccs);
    return (orgAc);
  }
};

export default helpers;
