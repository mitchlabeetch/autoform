import { parse, type ParseResult } from "@babel/parser";
import traverse, { type NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

/**
 * Webpack loader that adds data-dyad-id and data-dyad-name attributes
 * to the root JSX elements of React components.
 */
export default function componentTaggerLoader(
  this: { resourcePath: string },
  source: string
): string {
  // Skip files that already have the attributes
  if (source.includes("data-dyad-id") || source.includes("data-dyad-name")) {
    return source;
  }

  let ast: ParseResult<t.File>;

  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
    });
  } catch {
    return source;
  }

  const filePath = this.resourcePath;
  let componentIndex = 0;

  function nextId(name: string): string {
    const fileId = filePath.replace(/[^a-zA-Z0-9]/g, "-").slice(-40);
    return `${fileId}-${name}-${componentIndex++}`;
  }

  function isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
  }

  /**
   * Walk up from a JSXElement to see if it's a component root,
   * and if so, find the component name.
   */
  function findComponentName(
    path: NodePath<t.JSXElement>
  ): string | null {
    let parent: NodePath<t.Node> | null = path.parentPath;

    // Walk up to find the component declaration
    while (parent) {
      // Named function: function Foo() { return <jsx> }
      if (parent.isFunctionDeclaration()) {
        return parent.node.id?.name ?? null;
      }

      // Variable: const Foo = () => <jsx>  or  const Foo = function() { return <jsx> }
      if (parent.isVariableDeclarator()) {
        if (t.isIdentifier(parent.node.id)) {
          return parent.node.id.name;
        }
        return null;
      }

      // export default function Foo() { return <jsx> }
      if (parent.isExportDefaultDeclaration()) {
        const decl = parent.node.declaration;
        if (t.isFunctionDeclaration(decl) && decl.id) {
          return decl.id.name;
        }
        if (t.isIdentifier(decl)) {
          return decl.name;
        }
        return null;
      }

      // export function Foo() { return <jsx> }
      if (parent.isExportNamedDeclaration()) {
        const decl = parent.node.declaration;
        if (t.isFunctionDeclaration(decl) && decl.id) {
          return decl.id.name;
        }
        return null;
      }

      // Stop if we hit a JSX boundary (nested component)
      if (parent.isJSXElement() || parent.isJSXFragment()) {
        return null;
      }

      // Stop at other function boundaries (callbacks, etc.)
      if (
        parent.isFunctionExpression() ||
        parent.isArrowFunctionExpression()
      ) {
        // Check if this function is assigned to a variable declarator
        const grandParent = parent.parentPath;
        if (grandParent?.isVariableDeclarator()) {
          if (t.isIdentifier(grandParent.node.id)) {
            return grandParent.node.id.name;
          }
        }
        // Otherwise it's a callback — not a component
        return null;
      }

      // Stop if we somehow reach the program root without finding a component
      if (parent.isProgram()) {
        return null;
      }

      parent = parent.parentPath;
    }

    return null;
  }

  /**
   * Walk up from a JSXElement to determine if it's a root JSX element of a component.
   * A root JSX element is one that is returned (directly or indirectly) from a function.
   */
  function isRootJSXElement(path: NodePath<t.JSXElement>): boolean {
    let parent: NodePath<t.Node> | null = path.parentPath;
    while (parent) {
      // Directly inside a return statement: return <jsx>
      if (parent.isReturnStatement()) {
        return true;
      }

      // Arrow function body: () => <jsx>
      if (parent.isArrowFunctionExpression()) {
        // Check if the arrow is assigned to a component variable
        const grandParent = parent.parentPath;
        if (
          grandParent?.isVariableDeclarator() &&
          t.isIdentifier(grandParent.node.id) &&
          isComponentName(grandParent.node.id.name)
        ) {
          return true;
        }
        return false; // inline callback like .map(x => <jsx>)
      }

      // Nested inside another JSX element
      if (parent.isJSXElement() || parent.isJSXFragment()) {
        return false;
      }

      // Don't cross function boundaries
      if (
        parent.isFunctionDeclaration() ||
        parent.isFunctionExpression()
      ) {
        return false;
      }

      // Stop at program level
      if (parent.isProgram()) {
        return false;
      }

      parent = parent.parentPath;
    }
    return false;
  }

  function addAttributes(path: NodePath<t.JSXElement>): void {
    const opening = path.node.openingElement;

    const hasId = opening.attributes.some(
      (attr) =>
        t.isJSXAttribute(attr) && attr.name.name === "data-dyad-id"
    );
    if (hasId) return;

    const componentName = findComponentName(path);
    if (!componentName || !isComponentName(componentName)) return;

    const id = nextId(componentName);

    opening.attributes.push(
      t.jsxAttribute(
        t.jsxIdentifier("data-dyad-id"),
        t.stringLiteral(id)
      ),
      t.jsxAttribute(
        t.jsxIdentifier("data-dyad-name"),
        t.stringLiteral(componentName)
      )
    );
  }

  traverse(ast, {
    JSXElement(path) {
      if (isRootJSXElement(path)) {
        addAttributes(path);
      }
    },
  });

  const output = generate(ast, { retainLines: true }, source);
  return output.code;
}
