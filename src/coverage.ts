import { CoverageType, CoverageParser, ICoverage, ChangedFileWithLineNumbers } from './data';
import { setFailed, setCoverageOutputs, log } from './utils';
import parseOpencover from './parsers/opencover';
import parseCobertura from './parsers/cobertura';

const parsers: { [K in CoverageType]: CoverageParser } = {
  opencover: parseOpencover,
  cobertura: parseCobertura
};

export const processTestCoverage = async (
  coveragePath: string,
  coverageType: CoverageType,
  coverageThreshold: number,
  changedFilesAndLineNumbers: ChangedFileWithLineNumbers[]
): Promise<ICoverage | null> => {
  const coverage = await parsers[coverageType](coveragePath, coverageThreshold, changedFilesAndLineNumbers);

  if (!coverage) {
    log(`Failed parsing ${coveragePath}`);
    return null;
  }

  log(`Processed ${coveragePath}`);
  setCoverageOutputs(coverage);

  if (!coverage.success) {
    setFailed('Coverage Failed');
  }

  return coverage;
};
