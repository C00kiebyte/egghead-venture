export interface Term {
  word: string;
  definition: string;
  topics: string[];
}

export interface Module {
  title: string;
  terms: Term[];
  topics: string[];
}
