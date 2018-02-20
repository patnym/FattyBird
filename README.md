# TODO's
* Load assets only once, check on setup (AKA. Sprite dictionary)
* Cleanup function (Cleanup game if you wanna remove it)
* Debug drawing

# ISSUES

* Player sprite scaling issues

# REACT PORT

## Quick ported the game to react

### How to build

1. npm run build
2. Files in /lib are now ready to be linked via npm or published as a package
3. Create or download assets from github repo. Names must match 
4. Add Game to your react app, ex. `<Game width={800} height={600} assetPath={"."} />`

### React notes

It is also possible to just copy the entire src lib and incorporate into your own solution