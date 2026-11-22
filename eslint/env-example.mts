import type { ESLint, Rule } from "eslint";

const linePrefix = "// env ";
const lineBreak = /\r\n|[\n\r\u2028\u2029]/u;
const assignment = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/u;
const messages = {
  sectionComment: "Start each section with a nonempty # comment.",
  sectionSpacing: "Use exactly one blank line between sections.",
  assignment: "Place variable assignments directly below the section comment.",
  publicFirst:
    "Place NEXT_PUBLIC_ variables before other variables in this section.",
};

const envExample = {
  meta: { name: "firefly-env-example" },
  processors: {
    dotenv: {
      meta: { name: "dotenv" },
      preprocess(text) {
        const lines = text.split(lineBreak);
        if (lines.length > 1 && lines.at(-1) === "") lines.pop();

        // Wrap each line in a JavaScript comment while preserving line numbers.
        return [lines.map((line) => `${linePrefix}${line}`).join("\n")];
      },
      postprocess([messages]) {
        return messages;
      },
    },
  },
  rules: {
    layout: {
      meta: {
        type: "layout",
        schema: [],
        messages,
      },
      create(context) {
        function report(index: number, messageId: keyof typeof messages) {
          context.report({ loc: { line: index + 1, column: 0 }, messageId });
        }

        return {
          Program() {
            const lines = context.sourceCode.lines.map((line) =>
              line.slice(linePrefix.length).trim(),
            );
            let hasServerVariable = false;

            for (const [index, line] of lines.entries()) {
              const previous = lines[index - 1];
              if (!line && !previous) {
                report(
                  index,
                  index === 0 ? "sectionComment" : "sectionSpacing",
                );
                continue;
              }

              if (!line) {
                if (index === lines.length - 1) report(index, "sectionSpacing");
                continue;
              }

              if (!previous || line.startsWith("#")) {
                hasServerVariable = false;
                if (previous) report(index, "sectionSpacing");
                if (!/^#\s*\S/u.test(line)) {
                  report(index, "sectionComment");
                } else if (!assignment.test(lines[index + 1] ?? "")) {
                  report(index, "assignment");
                }
                continue;
              }

              const variable = assignment.exec(line)?.[1];
              if (!variable) {
                report(index, "assignment");
              } else if (!variable.startsWith("NEXT_PUBLIC_")) {
                hasServerVariable = true;
              } else if (hasServerVariable) {
                report(index, "publicFirst");
              }
            }
          },
        };
      },
    } satisfies Rule.RuleModule,
  },
} satisfies ESLint.Plugin;

export default envExample;
