# Navigation Configuration

This directory contains configuration files that define the structure of the application's navigation components.

## Header Navigation

The `navigation.yaml` file defines the dropdown menus in the header. You can modify this file to update the navigation structure without touching the React components.

### File Structure

The YAML file is structured as follows:

```yaml
# Main section key (used as identifier)
transactions:
  # Display label for this dropdown
  label: Transactions
  # Items in this dropdown
  items:
    # First menu item
    - label: All Transactions
      href: /dashboard/transactions
      icon: M4 6h16M4 10h16M4 14h16M4 18h16
      description: View your complete transaction history
    
    # Second menu item
    - label: Add Transaction
      href: /dashboard/transactions/new
      icon: M12 4v16m8-8H4
      description: Record a new expense or income
```

### Adding a New Dropdown

To add a new dropdown menu:

1. Add a new top-level key with a unique identifier
2. Define the `label` for this dropdown
3. Add an array of `items` with their properties

```yaml
settings:
  label: Settings
  items:
    - label: General
      href: /dashboard/settings
      icon: M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37
      description: Manage your application settings
```

### Adding Items to an Existing Dropdown

To add a new item to an existing dropdown:

1. Find the dropdown you want to modify
2. Add a new item to the `items` array

```yaml
transactions:
  label: Transactions
  items:
    # Existing items...
    
    # New item
    - label: Export Data
      href: /dashboard/transactions/export
      icon: M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4
      description: Export your transaction data
```

### Icon Definition

Icons are defined using SVG path data. The path is rendered inside an SVG element in the application.

To use a custom icon:
1. Create an SVG icon in a vector editor
2. Extract the `d` attribute from the path element
3. Add it to the `icon` property in the YAML file

## Implementation Details

The navigation data is loaded from this YAML file using the following process:

1. Server-side data loading in `src/lib/navigationMiddleware.ts`
2. Static data import in `src/utils/navigationLoader.ts` for client components
3. SVG icon generation in the Header component from path data

In a production environment, you would typically:
1. Load the YAML file on the server
2. Pass the data to client components via props or React Context
3. Update the YAML file to change the navigation without modifying code 
