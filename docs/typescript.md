# TypeScript

This framework makes extensive use of [TypeScript](http://www.typescriptlang.org). This is a superset of JavaScript that includes a flexible type system and class-based architecture.

Working with a TypeScript language is much like working with a standard node project with a few caveats. This is an effort to explain the most common issues that are bound to come up as you get started.

### 1. TypeScript Complies Into JavaScript

While vanilla JavaScript is evaluated in real-time without the need for compilation, TypeScript projects compile into plain JavaScript that runs in any compatible JavaScript engine (such as node.js, Chrome, Firefox etc.).

This is handled by the TypeScript compiler, which comes bundled with Visual Studio Code. Otherwise it an be installed via npm: `npm install -g typescript`.

Once installed, you can compile TypeScript by calling the compiler:
```
$> tsc my-script.ts
```

### 2. Use an Editor with TypeScript Support

TypeScript works best in editors that support the TypeScript compiler. Not surprisingly, [Visual Studio Code](http://code.visualstudio.com) ships with the most robust TypeScript support. It will perform real-time type-checking and warn you of potential compiler errors long in advance. [Atom](http://www.atom.io) also has a great TypeScript plugin almost as good as the one bundled with Code.

### 3. tsconfig.json

The TypeScript compiler uses a file named `tsconfig.json` for configuration. While the sample app comes with a pre-configured `tsconfig.json` file that outputs a TypeScript files found in the `src` folder to `build`, if working on a custom project or your own thing, you can generate a fresh `tsconfig.json` with the `tsc --init` command.

Read over the [guide](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) for more information about configuring the TypeScript compiler.  

### 4. Interfaces...not just for interfaces any more?

TypeScript makes extensive use of interfaces to define the properties of dynamic JavaScript objects and functions. It tells the compiler how a particular function should behave or what key/value pairs belong on an object. 

For instance, an options object for a class that sends emails via SMTP might look like this:

```
{
    defaultFrom: 'hello@swarmnyc.com',
    username: 'swarm',
    password: 'password',
    server: 'smtp.swarmnyc.com',
    ssl: false
}
```

However, when passing that options object into the email helper's constructor function...how will the compiler know that the correct properties are being passed through? That's where interfaces come into play:

```
interface EmailServiceOptions {
    defaultFrom?: string,
    username: string,
    password: string,
    server: string,
    ssl?: boolean
}

class EmailService {
    constructor(options: EmailServiceOptions) {
        this.ssl = options.ssl || false;
        this.username = options.username;
        this.password = options.password;
        this.from = options.defaultFrom || 'hello@example.com';
        this.server = options.server;
    }
}
``` 

Since we specify the valid properties and their corresponding value types (`?:` denotes an optional property), the TypeScript compiler can ensure values we pass into the EmailService constructor are properly configured.

We also use interfaces to define functions:

```
interface CallbackFn {
    (err?: Error, results?: string[]): void
}

// Now we can use the CallbackFn interface as a type

function query(callback: CallbackFn) {
    db.query().then(callback);
}
``` 

### 4. Avoid using 'any' as a crutch

TypeScript provides a wildcard type called `any` which can be used to disable type-checking. While sometimes necessary when working with third-party libraries, it's tempting to use `any` in your own code as a shortcut. Particularly instead of defining interfaces for functions, plain objects with set keys, etc.

This should be avoided because it effectively undermines the TypeScript compiler's ability to check your work. When the compiler sees `any`, it stops following that reference as it is passed through your program, and will fail to report any misuse of it down the line.

Imagine if the example from 3 above. If we used the `any` type instead of specifying an interface of options, all sorts of things could go wrong that the compiler has no chance of catching:

```
class EmailService {
    constructor(options: any) {

    }
}

const badService = new EmailService({
    defaultFrom: 59
}); // compiler would allow this

const worseService = new EmailService(1); // this too

const worstService = new EmailService(undefined); // you guessed it, this would get by the compiler too
```

So in summary...don't use `any` unless you really really need to.

### 5. Third-party Node Library Support & Type Definitions

For TypeScript to truly work, and to take advantage of the huge ecosystem of packages available on npm, it is necessary to install *type definition* files for third-party modules. 

Type definitions are similar to header files in other programming languages. They enumerate the methods and types exposed by the module. The TypeScript compiler hooks into those to provide code hints and to enforce its type system.

Most popular npm packages have published type libraries and there are tools available to generate types. Microsoft is adding on-demand downloading of type definitions to Visual Studio Code, but until then there are a number of third-party tools to make it easier.

The most popular tool is Typings. It works much like npm and bundles apps with a typings.json file that is similar to npm's package.json.

Install Typings:

```
$> npm install -g typings
``` 

Start a new typings project (creates a new typings.json file):

```
$> typings init
```

Add node default libraries to your typings.json:

```
$> typings install --save node
```

Typings searches a number of different registries for type definitions. In the event multiple results are found, it is necessary to specify the library to pull from:

```
$> typings install --save --global dt~node
```

Then in the future, simply run `typings install` to install all typings in typings.json.

### Global vs. Module

Note the use of the `--global` flag in the example above. In JavaScript, there are two main methods of exposing libraries: *global*, and *module*. Depending on how the underlying library was written, it may be necessary to install type definitions in the global scope. Luckily Typings will prompt you when a definition needs to be installed with the `--global` flag.

### dts-gen

If you are trying to use a library for which Typings has no definitions, it will be necessary to create your own. Microsoft has a tool called dts-gen that will attempt to do this with any npm package you specify.

For example, if we wanted to use dts-gen to create a type definition for the lodash library, we'd do the following:

```
# Install dts-gen and make it globally available from the command-line
$> npm install -g dts-gen

# Install the lodash library globally (dts-gen only works on global modules)
$> npm install -g lodash

# Run dts-gen on lodash
$> dts-gen -m lodash

# Remove global lodash to prevent conflicts with projects
$> npm uninstall -g lodash
```

dts-gen will output a lodash.d.ts file. Personally my experience with dts-gen has been mixed, but it beats writing a definition file from hand.

### Writing Your Own Definitions

This last option is a pain and should only generally be necessary when using obscure or unpopular packages from npm. Writing your own type definition means creating your own .d.ts file that documents all of a libary's types, methods, and properties. Depending on the size of the library this might be a daunting task.

It often requires a deep-dive into a library's code to see how every method behaves. Identifying all the return types and possible permutations of various functions and objects. In short, it sucks. I recommend trying to find an alternative library for which a type definition already exists.

But if you really really really want to roll your own, I recommend going through the [official guide](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) first. 