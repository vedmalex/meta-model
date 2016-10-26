export default  function decapitalize(name: string): string {
  return name[0].toLowerCase() + name.slice(1);
}