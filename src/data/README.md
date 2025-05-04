# Data Management

This directory contains static data files used throughout the application.

## Navigation Data

The navigation structure is defined in `navigation.yaml` and is used to generate the application's navigation menu. The data is loaded in two ways:

1. Server-side loading in `src/lib/navigationMiddleware.ts` for server components
2. Client-side loading via API route in `src/utils/navigationLoader.tsx` for client components

The YAML file contains the following structure:

```yaml
section:
  label: "Section Name"
  items:
    - label: "Item Name"
      href: "/path"
      icon: "ICON_NAME"
      description: "Item description"
```

Icons are mapped to React components in the navigation loader, which converts the YAML data into a format suitable for rendering in the UI.
