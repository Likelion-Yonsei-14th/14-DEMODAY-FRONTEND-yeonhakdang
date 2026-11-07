/** Client feature access; server APIs still enforce their own session authorization. */
export function requiresMember(screen: string): boolean {
  return /^4-\d+$/.test(screen) || /^5-\d+$/.test(screen);
}

export function visibleScreen(screen: string, loggedIn: boolean): string {
  return requiresMember(screen) && !loggedIn ? "2-4" : screen;
}
