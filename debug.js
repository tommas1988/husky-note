const projectPlugins = Object.keys(this.pkg.devDependencies || {})
      .concat(Object.keys(this.pkg.dependencies || {}))
      .filter(isPlugin)
      .map(id => {
        if (
          this.pkg.optionalDependencies &&
            id in this.pkg.optionalDependencies
        ) {
          let apply = loadModule(id, this.pkgContext)
          if (!apply) {
            warn(`Optional dependency ${id} is not installed.`)
            apply = () => {}
          }

          return { id, apply }
        }});

console.log(projectPlugins);
