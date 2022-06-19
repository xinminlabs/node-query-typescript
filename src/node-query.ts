import Adapter from "./adapter";
import SyntaxError from "./syntax-error";
const { parser } = require("./parser");
const { ExpressionList } = require("./compiler");

class NodeQuery<T> {
  private expression: InstanceType<typeof ExpressionList>;

  private static adapter?: Adapter<any>;

  static configure(options: { adapter: Adapter<any> }) {
    this.adapter = options.adapter;
  }

  static getAdapter(): Adapter<any> {
    if (!this.adapter) {
      const TypescriptAdapter = require("./typescript-adapter");
      this.adapter = new TypescriptAdapter();
    }
    return this.adapter!;
  }

  constructor(nql: string) {
    try {
      parser.parse(nql);
      this.expression = parser.yy.result;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.startsWith("Lexical error") ||
          error.message.startsWith("Parse error"))
      ) {
        throw new SyntaxError(error.message.split("\n").slice(0, 3).join("\n"));
      } else {
        throw error;
      }
    }
  }

  parse(node: T): T[] {
    return this.expression.queryNodes(node);
  }
}

export default NodeQuery;
