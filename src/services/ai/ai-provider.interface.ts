export interface AIProvider {
  improveDescription(description: string): Promise<string>;
}
