import ast
import builtins
import sys

def check_file(filepath):
    print(f"\nAnalyzing: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=filepath)

    # Collect defined names (imports, class/function definitions, global variables)
    defined = set(dir(builtins))
    
    # We also want to record names that are defined as variables or imported
    class DefinitionVisitor(ast.NodeVisitor):
        def visit_Import(self, node):
            for alias in node.names:
                defined.add(alias.asname or alias.name)
            self.generic_visit(node)
            
        def visit_ImportFrom(self, node):
            for alias in node.names:
                defined.add(alias.asname or alias.name)
            self.generic_visit(node)
            
        def visit_FunctionDef(self, node):
            defined.add(node.name)
            # Do not traverse inside function bodies for definition collection yet
            
        def visit_AsyncFunctionDef(self, node):
            defined.add(node.name)
            
        def visit_ClassDef(self, node):
            defined.add(node.name)
            
        def visit_Assign(self, node):
            for target in node.targets:
                if isinstance(target, ast.Name):
                    defined.add(target.id)
                elif isinstance(target, ast.Tuple) or isinstance(target, ast.List):
                    for el in target.elts:
                        if isinstance(el, ast.Name):
                            defined.add(el.id)
            self.generic_visit(node)

    visitor = DefinitionVisitor()
    visitor.visit(tree)

    # Let's inspect variable usage inside functions
    errors = []
    
    class UsageVisitor(ast.NodeVisitor):
        def __init__(self):
            # Track local scopes
            self.scopes = [set()]
            
        def visit_FunctionDef(self, node):
            # Push local scope with arguments
            local_scope = {arg.arg for arg in node.args.posonlyargs + node.args.args + node.args.kwonlyargs}
            if node.args.vararg:
                local_scope.add(node.args.vararg.arg)
            if node.args.kwarg:
                local_scope.add(node.args.kwarg.arg)
            self.scopes.append(local_scope)
            self.generic_visit(node)
            self.scopes.pop()
            
        def visit_AsyncFunctionDef(self, node):
            self.visit_FunctionDef(node)
            
        def visit_Name(self, node):
            if isinstance(node.ctx, ast.Store):
                # Save to current scope
                self.scopes[-1].add(node.id)
            elif isinstance(node.ctx, ast.Load):
                # Check if name is defined in any scope from local to global
                name = node.id
                found = False
                for scope in reversed(self.scopes):
                    if name in scope:
                        found = True
                        break
                if not found and name not in defined:
                    # Ignore common framework or dynamic names if any
                    errors.append((node.lineno, name))

    usage_visitor = UsageVisitor()
    usage_visitor.visit(tree)
    
    if errors:
        print(f"Found {len(errors)} potential undefined name errors:")
        for line, name in sorted(set(errors)):
            print(f"  Line {line}: Undefined name `{name}`")
    else:
        print("No undefined name errors found.")

if __name__ == "__main__":
    check_file("routers/admin.py")
    check_file("routers/brand_head.py")
