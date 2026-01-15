# Common workflows - Claude Code Docs

Each task in this document includes clear instructions, example commands, and best practices to help you get the most from Claude Code.

---

## Understand new codebases

### Get a quick codebase overview

Suppose you've just joined a new project and need to understand its structure quickly.

1. Navigate to the project root directory
```bash
cd /path/to/project
```

2. Start Claude Code
```bash
claude
```

3. Ask for a high-level overview
```
> give me an overview of this codebase
```

4. Dive deeper into specific components
```
> explain the main architecture patterns used here
> what are the key data models?
> how is authentication handled?
```

**Tips:**
- Start with broad questions, then narrow down to specific areas
- Ask about coding conventions and patterns used in the project
- Request a glossary of project-specific terms

### Find relevant code

Suppose you need to locate code related to a specific feature or functionality.

1. Ask Claude to find relevant files
```
> find the files that handle user authentication
```

2. Get context on how components interact
```
> how do these authentication files work together?
```

3. Understand the execution flow
```
> trace the login process from front-end to database
```

**Tips:**
- Be specific about what you're looking for
- Use domain language from the project

---

## Fix bugs efficiently

Suppose you've encountered an error message and need to find and fix its source.

1. Share the error with Claude
```
> I'm seeing an error when I run npm test
```

2. Ask for fix recommendations
```
> suggest a few ways to fix the @ts-ignore in user.ts
```

3. Apply the fix
```
> update user.ts to add the null check you suggested
```

**Tips:**
- Tell Claude the command to reproduce the issue and get a stack trace
- Mention any steps to reproduce the error
- Let Claude know if the error is intermittent or consistent

---

## Refactor code

Suppose you need to update old code to use modern patterns and practices.

1. Identify legacy code for refactoring
```
> find deprecated API usage in our codebase
```

2. Get refactoring recommendations
```
> suggest how to refactor utils.js to use modern JavaScript features
```

3. Apply the changes safely
```
> refactor utils.js to use ES2024 features while maintaining the same behavior
```

4. Verify the refactoring
```
> run tests for the refactored code
```

**Tips:**
- Ask Claude to explain the benefits of the modern approach
- Request that changes maintain backward compatibility when needed
- Do refactoring in small, testable increments

---

## Use specialized subagents

Suppose you want to use specialized AI subagents to handle specific tasks more effectively.

1. View available subagents
```
> /agents
```
This shows all available subagents and lets you create new ones.

2. Use subagents automatically

Claude Code automatically delegates appropriate tasks to specialized subagents:
```
> review my recent code changes for security issues
> run all tests and fix any failures
```

3. Explicitly request specific subagents
```
> use the code-reviewer subagent to check the auth module
> have the debugger subagent investigate why users can't log in
```

4. Create custom subagents for your workflow
```
> /agents
```
Then select "Create New subagent" and follow the prompts to define:
- A unique identifier that describes the subagent's purpose (e.g., code-reviewer, api-designer)
- When Claude should use this agent
- Which tools it can access
- A system prompt describing the agent's role and behavior

**Tips:**
- Create project-specific subagents in `.claude/agents/` for team sharing
- Use descriptive description fields to enable automatic delegation
- Limit tool access to what each subagent actually needs

---

## Use Plan Mode for safe code analysis

Plan Mode instructs Claude to create a plan by analyzing the codebase with read-only operations, perfect for exploring codebases, planning complex changes, or reviewing code safely.

### When to use Plan Mode

- **Multi-step implementation**: When your feature requires making edits to many files
- **Code exploration**: When you want to research the codebase thoroughly before changing anything
- **Interactive development**: When you want to iterate on the direction with Claude

### How to use Plan Mode

**Turn on Plan Mode during a session**

You can switch into Plan Mode during a session using **Shift+Tab** to cycle through permission modes.

- Normal Mode → **Shift+Tab** → Auto-Accept Mode (`⏵⏵ accept edits on`)
- Auto-Accept Mode → **Shift+Tab** → Plan Mode (`⏸ plan mode on`)

**Start a new session in Plan Mode**
```bash
claude --permission-mode plan
```

**Run "headless" queries in Plan Mode**
```bash
claude --permission-mode plan -p "Analyze the authentication system and suggest improvements"
```

### Example: Planning a complex refactor

```bash
claude --permission-mode plan
```

```
> I need to refactor our authentication system to use OAuth2. Create a detailed migration plan.
```

Claude analyzes the current implementation and creates a comprehensive plan. Refine with follow-ups:
```
> What about backward compatibility?
> How should we handle database migration?
```

### Configure Plan Mode as default

```json
// .claude/settings.json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

---

## Work with tests

Suppose you need to add tests for uncovered code.

1. Identify untested code
```
> find functions in NotificationsService.swift that are not covered by tests
```

2. Generate test scaffolding
```
> add tests for the notification service
```

3. Add meaningful test cases
```
> add test cases for edge conditions in the notification service
```

4. Run and verify tests
```
> run the new tests and fix any failures
```

Claude can generate tests that follow your project's existing patterns and conventions. When asking for tests, be specific about what behavior you want to verify.

For comprehensive coverage, ask Claude to identify edge cases you might have missed.

---

## Create pull requests

Suppose you need to create a well-documented pull request for your changes.

1. Summarize your changes
```
> summarize the changes I've made to the authentication module
```

2. Generate a pull request with Claude
```
> create a pr
```

3. Review and refine
```
> enhance the PR description with more context about the security improvements
```

4. Add testing details
```
> add information about how these changes were tested
```

**Tips:**
- Ask Claude directly to make a PR for you
- Review Claude's generated PR before submitting
- Ask Claude to highlight potential risks or considerations

---

## Handle documentation

Suppose you need to add or update documentation for your code.

1. Identify undocumented code
```
> find functions without proper JSDoc comments in the auth module
```

2. Generate documentation
```
> add JSDoc comments to the undocumented functions in auth.js
```

3. Review and enhance
```
> improve the generated documentation with more context and examples
```

4. Verify documentation
```
> check if the documentation follows our project standards
```

**Tips:**
- Specify the documentation style you want (JSDoc, docstrings, etc.)
- Ask for examples in the documentation
- Request documentation for public APIs, interfaces, and complex logic

---

## Work with images

Suppose you need to work with images in your codebase, and you want Claude's help analyzing image content.

1. Add an image to the conversation

You can use any of these methods:
- Drag and drop an image into the Claude Code window
- Copy an image and paste it into the CLI with `ctrl+v` (Do not use `cmd+v`)
- Provide an image path to Claude: "Analyze this image: /path/to/your/image.png"

2. Ask Claude to analyze the image
```
> What does this image show?
> Describe the UI elements in this screenshot
> Are there any problematic elements in this diagram?
```

3. Use images for context
```
> Here's a screenshot of the error. What's causing it?
> This is our current database schema. How should we modify it for the new feature?
```

4. Get code suggestions from visual content
```
> Generate CSS to match this design mockup
> What HTML structure would recreate this component?
```

**Tips:**
- Use images when text descriptions would be unclear or cumbersome
- Include screenshots of errors, UI designs, or diagrams for better context
- You can work with multiple images in a conversation
- Image analysis works with diagrams, screenshots, mockups, and more

---

## Reference files and directories

Use `@` to quickly include files or directories without waiting for Claude to read them.

1. Reference a single file
```
> Explain the logic in @src/utils/auth.js
```
This includes the full content of the file in your message.

2. Reference a directory
```
> What components are in @src/components/
```

3. Reference multiple files
```
> Compare @src/old/auth.js with @src/new/auth.js
```

**Tips:**
- Use `@` for files you know you want Claude to see immediately
- Tab completion works with `@` paths
- This is faster than having Claude search for files

---

## Use extended thinking

For complex problems, enable extended thinking to get Claude's deeper reasoning.

1. Enable extended thinking
```
> /config
```
Navigate to thinking settings and enable.

2. Ask complex questions
```
> With extended thinking, analyze the security implications of our current auth flow
```

**When to use extended thinking:**
- Architectural decisions
- Security analysis
- Complex debugging
- Performance optimization planning

---

## Memory and context

Claude Code maintains context within a session.

### Within a session
- Claude remembers all previous messages
- Reference earlier conversations: "remember when we discussed X"
- Build on previous work: "now apply that pattern to Y"

### Across sessions
- Use `CLAUDE.md` files to persist important context
- Claude reads these at session start

### Managing context
- Start new sessions for unrelated tasks
- Use `/clear` to reset context within a session
- Be explicit about context when switching topics

---

## Customize with CLAUDE.md

Create a `CLAUDE.md` file in your project root to provide persistent context.

### Example CLAUDE.md
```markdown
# Project: E-commerce Platform

## Architecture
- Frontend: React 18 with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL with Prisma ORM

## Conventions
- Use functional components with hooks
- Follow Airbnb style guide
- Write tests for all new features

## Common Commands
- `npm run dev` - Start development server
- `npm run test` - Run test suite
- `npm run lint` - Check code style

## Key Files
- `src/api/` - Backend API routes
- `src/components/` - React components
- `prisma/schema.prisma` - Database schema
```

**Tips:**
- Keep it concise but informative
- Update as the project evolves
- Include team conventions and standards

---

## Best practices summary

1. **Be specific** - Clear prompts get better results
2. **Iterate** - Refine Claude's output through follow-up questions
3. **Verify** - Review changes before accepting
4. **Use context** - Reference files with `@`, use `CLAUDE.md`
5. **Test incrementally** - Verify changes work before moving on
6. **Plan first** - Use Plan Mode for complex changes
7. **Document** - Ask Claude to document as you go

---

*Source: https://code.claude.com/docs/en/common-workflows*
