export class Logger {
  static info(message: string) {
    console.log(`[INFO] ${message}`);
  }

  static warn(message: string) {
    console.warn(`[WARNING] ${message}`);
  }

  static error(message: string) {
    console.error(`[ERROR] ${message}`);
  }

  static success(message: string) {
    console.log(`[SUCCESS] ${message}`);
  }
}