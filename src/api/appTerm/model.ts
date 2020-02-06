export interface ISetAppTermBody {
  type: number;
  translations: Array<{
    language: number;
    body: string;
  }>;
}