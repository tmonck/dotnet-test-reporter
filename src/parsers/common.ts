import { ICoverage, ICoverageData, ICoverageFile, ICoverageModule, ChangedFileWithLineNumbers } from '../data';
import { readXmlFile } from '../utils';

export const calculateCoverage = (covered: number, total: number): number => {
  return total ? Math.round((covered / total) * 10000) / 100 : 100;
};

export const  calculateChangedLineTotals = (modules: ICoverageModule[]): number => {
  return Number(modules.reduce((summ, m) => summ + Number(m.files.reduce((summ2, f) => summ2 + Number(f.changedLinesTotal), 0)), 0))
}
export const  calculateChangedLinesCovered = (modules: ICoverageModule[]): number => {
  return Number(modules.reduce((summ, m) => summ + Number(m.files.reduce((summ2, f) => summ2 + Number(f.changedLinesCovered), 0)), 0))
}

export const createCoverageModule = (
  name: string,
  threshold: number,
  files: ICoverageFile[],
  complexity: number = 0
): ICoverageModule => {
  const total = files.reduce((summ, file) => summ + file.linesTotal + file.branchesTotal, 0);
  const covered = files.reduce((summ, file) => summ + file.linesCovered + file.branchesCovered, 0);
  const coverage = calculateCoverage(covered, total);
  const success = !threshold || coverage >= threshold;

  const updatedFiles = files
    .map(file => ({
      ...file,
      totalCoverage: calculateCoverage(file.linesCovered + file.branchesCovered, file.linesTotal + file.branchesTotal),
      lineCoverage: calculateCoverage(file.linesCovered, file.linesTotal),
      branchCoverage: calculateCoverage(file.branchesCovered, file.branchesTotal),
      changedLineCoverage: calculateCoverage(file.changedLinesCovered, file.changedLinesTotal)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { name, coverage, success, files: updatedFiles, complexity };
};

export const parseCoverage = async (
  filePath: string,
  threshold: number,
  changedFilesAndLineNumbers: ChangedFileWithLineNumbers[],
  parseSummary: (file: any, modules: ICoverageModule[]) => ICoverageData,
  parseModules: (file: any, threshold: number, changedFilesAndLineNumbers: ChangedFileWithLineNumbers[]) => ICoverageModule[]
): Promise<ICoverage | null> => {
  const file = await readXmlFile(filePath);

  if (!file) {
    return null;
  }

  const modules = parseModules(file, threshold, changedFilesAndLineNumbers);
  const summary = parseSummary(file, modules);
  const success = !threshold || summary.totalCoverage >= threshold;

  return { success, ...summary, modules };
};
