import ICoverageData from './ICoverageData';

export default interface ICoverageFile extends ICoverageData {
  id: string;
  name: string;
  linesToCover: number[];
}
