declare module "*.yaml" {
  const content: {
    [key: string]: {
      label: string;
      items: Array<{
        label: string;
        href: string;
        icon: string;
        description: string;
      }>;
    };
  };
  export default content;
}
