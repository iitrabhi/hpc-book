# Effective TypeScript

## 1 - Getting to Know TypeScript

### Item 1 : Understand the Relationship Between TypeScript and JavaScript

- Tout programme JavaScript est un programme TypeScript, mais l’inverse n’est pas vrai.
- Le transpiler TypeScript indique des problèmes y compris sur du code JavaScript pur.
- Il y a une **différence entre transpiler et type-checker** du code.
  - Le type-check est plus strict, et ne laisse pas passer certaines des bizarreries de JavaScript.

### Item 2 : Know Which TypeScript Options You’re Using

- On a la possibilité de choisir des options pour le type-checker. Parmi les plus importants que l’auteur conseille d’activer :
  - **noImplicitAny** : on empêche l’inférence automatique de type `any`. Les `any` ne seront autorisés que s’ils sont explicitement écrits.
  - **strictNullChecks** : on empêche l’assignation de `null` et d’`undefined` à n’importe quelle variable, sauf si on le définit explicitement.
    - Par exemple, on n’aura plus le droit de faire `const x: number = null;`.
    - Ca aide à repérer les cas où on va avoir une erreur _“Cannot read properties on undefined”_ au runtime.
  - **strict** : empêche la plupart des erreurs runtime que TypeScript peut éviter, et inclut les deux autres.

### Item 3 : Understand That Code Generation Is Independent of Types

- Le type-checking et la transpilation sont **indépendants**. On peut tout à fait transpiler avec _tsc_ du code qui a des erreurs au type-checker.
  - Un des avantages c’est qu’on peut exécuter le code avant même d’avoir fixé toutes les erreurs de type.
- Les types disparaissent et n’ont **aucun impact au runtime**.

  - Pour faire du type-checking au runtime, il faut se baser sur des objets JavaScript : par exemple des classes.
  - Les _tagged unions_ sont aussi courants :

    ```typescript
    interface Square {
      kind: "square";
      width: number;
    }
    interface Rectangle {
      kind: "rectandle";
      width: number;
      height: number;
    }
    type Shape = Square | Rectangle;

    function calculateArea(shape: Shape) {
      if(shape.kind === "rectangle") {
    // [...]
    ```

### Item 4 : Get Comfortable with Structural Typing

- Le typage de TypeScript est **structurel**. Ca veut dire qu’une valeur avec un type structurellement compatible sera acceptée, même si le type n’est pas exactement le même.
  - En pratique, ça veut surtout dire qu’un objet qui a des attributs supplémentaires pourra être passé là où on attendait un objet avec moins d’attributs.
  - C’est pour cette raison par exemple qu’`Object.keys(v)` ne renvoie pas le type des keys de l’objet mais des strings : **on n’est pas sûr qu’il n’y ait pas des attributs en plus**.
  - Ca s’applique aussi aux classes : attendre un type d’une classe ne garantit pas qu’on n’aura pas un objet custom ou une autre classe qui a au moins les mêmes attributs et éventuellement d’autres en plus.

### Item 5 : Limit Use of the `any` Type

- L’utilisation d’`any` ou d’`as any` permet de **désactiver le type-checking**, il faut l’éviter au maximum.
  - Il permet de “casser les contrats”, par exemple une fonction attendant un type précis acceptera quand même un objet qu’on a typé `any`.
  - Il empêche l’autocomplétion, et même le **renommage automatique d’attribut** (si une variable est marquée comme `any`, l’éditeur ne pourra pas savoir qu’il faut renommer un de ses attributs).
  - Il sape la confiance dans le type system.

## 2 - TypeScript's Type System

### Item 6 : Use Your Editor to Interrogate and Explore the Type System

- TypeScript fournit un compilateur (tsc), mais aussi un serveur standalone (tsserver) permettant notamment de faire de l’introspection de types. C’est ça qui est utilisé par l’éditeur.
- Il ne faut pas hésiter à passer la souris sur un appel de fonction dans une chaîne d’appels pour connaître les types inférés à ce moment-là.

### Item 7 : Think of Types as Sets of Values

- Le typage de TypeScript peut être **interprété comme un set de types**.
  - `never` est le set vide.
  - Un littéral contient une seule valeur dans le set.
  - `A | B` réalise l’union entre A et B.
  - `A & B` réalise l’intersection entre A et B.
    - `&` entre deux objets permet d’obtenir le type d’un objet avec l’ensemble des attributs des deux.
      - Exemple :
        ```typescript
        interface Person {
          name: string;
        }
        interface Lifespan {
          birth: Date;
          death?: Date;
        }
        type PersonSpan = Person & Lifespan;
        ```
      - C’est le cas parce qu’on peut ajouter autant d’attributs en plus qu’on veut, vu que c’est du structural typing. Donc l’intersection se trouve être un objet avec les propriétés des deux obligatoirement (sinon ce ne serait pas une intersection), et d’autres propriétés non indiquées optionnellement.
- Pour assigner une valeur à une variable, il faut que tous les éléments du set du type de la valeur soient contenus dans le type de la variable.
  - `extends` permet d’indiquer la même chose : tous les éléments du type qui était doivent être inclus dans le type qui est étendu.

### Item 8 : Know How to Tell Whether a Symbol Is in the Type Space or Value Space

- Il existe **deux espaces différents** dans lesquels des symboles peuvent se référer à des choses : le **Type space** et le **Value space**.
  - Un même symbole peut être défini dans l’un et l’autre de ces espaces pour désigner différentes choses.
  - Le fait d’être dans l’un ou l’autre de ces espaces dépend du contexte dans lequel on se trouve. Par exemple en assignation à un `type`, en assignation à une variable `let` ou `const`, après une variable suivie d’un `:` etc…
  - Le TypeScript Playground permet facilement de se rendre compte de ce qui est dans le _Type space_ : ça disparaît à la transpiration.
- Les classes et les enums créent en même temps un symbole dans le _Type space_, et un autre dans le _Value space_.
  - Le type issu d’une classe représente sa structure d’attributs.
- Le mot clé `typeof` agit différemment en fonction de l’espace où il est utilisé :
  - Dans le _Value space_ il va renvoyer un string caractérisant la valeur, par exemple `"object"` ou `"function"`.
  - Dans le _Type space_ il va renvoyer le type caractérisant la valeur.
  - `typeof MaClasse` (si utilisé dans le _Type space_) retourne le type de la classe elle-même, alors que `MaClasse` (si utilisé dans le _Type space_) représente le type d’une instance de cette classe.
  - `InstanceType<T>` permet de retrouver le type de l’instance à partir du type de la classe. Par exemple :
    ```typescript
    InstanceType<typeof MaClasse>; // donne le type MaClasse
    ```
- On peut accéder aux attributs d’un objet :
  - Si c’est une valeur, avec `objet["nom"]` ou `objet.nom`.
  - Si c’est un type, avec seulement `Type["nom"]`.

### Item 9 : Prefer Type Declarations to Type Assertions

- Il vaut mieux utiliser **les _type declarations_ plutôt que les _type assertions_**.
  - Exemple :
    ```typescript
    type Person = { name: string };
    // Type declaration, à préférer
    const alice: Person = { name: "Alice" };
    // Type assertion, déconseillé
    const bob = { name: "Bob" } as Person;
    ```
  - La raison est que **le type declaration va vérifier le type** qu’on assigne, alors que **le type assertion ne vérifie pas**, et permet d’outrepasser TypeScript dans le cas où on en sait plus que lui sur le contexte d’un cas particulier.
  - Pour autant, même avec le type type assertion, on ne peut pas assigner n’importe quoi, il faut au minimum que la valeur qu’on assigne soit d’un sous-type de la valeur à laquelle on l’assigne.
    - Pour forcer un type complètement arbitraire, on peut passer par `unknown` ou `any`.
      ```typescript
      document.body as unknown as Person;
      ```
  - En plus du `as`, on a aussi le `!` placé en suffixe qui permet de faire une forme de type assertion, en indiquant qu’on est sûr que la valeur n’est pas `null`.
    ```typescript
    const el = document.getElementById("foo")!;
    ```
- Pour utiliser le type declaration dans la fonction passée à un `map`, on peut typer sa valeur de retour.
  ```typescript
  ["alice", "bob"].map((name): Person => ({ name }));
  ```
  - Ici on demande à TypeScript d’inférer la valeur de name, et on indique que la valeur de retour devra être Person.

### Item 10 : Avoid Object Wrapper Types (String, Number, Boolean, Symbol, BigInt)

- Les types primitifs (_string_, _number_, _boolean_, _symbol_ et _bigint_) ne possèdent pas d’attributs comme peuvent en posséder les objets.
  - Quand on utilise un attribut connu sur l’un d’entre eux, JavaScript crée un un objet éphémère correspondant (respectivement _String_, _Number_, _Boolean_, _Symbol_ et _BigInt_) pour le wrapper et fournir l’attribut en question.
    ```typescript
    // l'attribut charAt vient de l'objet String
    "blabla".charAt(3);
    ```
  - C’est pour ça que si on assigne une propriété à une valeur primitive, la propriété disparaît (avec l’objet associé créé pour l’occasion et détruit aussitôt).
- Il vaut mieux **éviter d’instancier les objets correspondant aux types primitifs**, ça n’apporte rien à part de la confusion.
  - Exemple :
    ```typescript
    const person = new String("Alice");
    ```
  - En revanche, utiliser ces objets sans le new est tout à fait OK, ça nous donne une valeur primitive comme résultat.
    ```typescript
    Boolean(3); // renvoie true
    ```
- Il vaut mieux **éviter d’utiliser les objets correspondant aux types primitifs dans le Type space**. Ça pose le problème que le type primitif est assignable au type objet wrapper, alors que l’inverse n’est pas vrai.
  - Exemple :
    ```typescript
    function getPerson(person: string) {
      // [...]
    }
    getPerson(new String("Alice")); // Erreur de type
    ```

### Item 11 : Recognize the Limits of Excess Property Checking

- Bien que TypeScript ait un typage structurel, il existe un mécanisme particulier qui s’appelle **excess property checking**, et qui permet d’avoir un comportement strict et non pas structurel.
  - Ce mode s’active quand on passe **une valeur littérale** à une fonction, ou qu’on l’assigne à une variable.
    - Et il est actif uniquement quand on est dans le cadre d’une _type declaration_, pas dans le cadre d’une _type assertion_.
  - Exemple :
    ```typescript
    type Person = {
      name: string;
    }
    const alice: Person = {
      name: "Alice";
      age: 20; // Erreur, age n'existe pas sur Person
    }
    ```
  - Dans le cas où on veut que le type ait **systématiquement un comportement structurel**, même dans le cas de l’_excess property checking_, on peut l’indiquer :
    ```typescript
    type Person = {
      name: string;
      [other: string]: unknown;
    };
    ```
- Il existe un autre mécanisme similaire : il s’agit des **weak types**, c’est-à-dire des types objets qui n’ont **que des attributs optionnels**.
  - Ce mécanisme s’applique tout le temps, et non pas juste dans le cas d’assignation de valeur littérale.
  - La règle c’est qu’on doit assigner une valeur qui a **au minimum un attribut en commun** avec le _weak type_.
  - Exemple :
    ```typescript
    type Person = {
      name?: string;
      age?: number;
    };
    const alice = { firstName: "alice" };
    const alicePerson: Person = alice; // Erreur : aucun attribut en commun
    ```

### Item 12 : Apply Types to Entire Function Expressions When Possible

- On peut **typer une fonction entière** si elle est une _function expression_, c’est-à-dire si elle n’est pas une fonction déclarée classiquement, mais plutôt une valeur qu’on peut passer à une variable.
- Typer une fonction entière est utile notamment si :
  - On a **plusieurs fonctions qui ont la même signature**, et qu’on veut être plus concis.
    ```typescript
    type BinaryFn = (a: number, b: number) => number;
    const add: BinaryFn = (a, b) => a + b;
    const sub: BinaryFn = (a, b) => a - b;
    ```
  - On a une fonction qui **doit avoir la même signature qu’une fonction existante**. Dans ce cas on peut utiliser `typeof`.
    ```typescript
    const checkedFetch: typeof fetch = async (input, init) => {
      const response = await fetch(input, init);
      // [...]
      return response;
    };
    ```

### Item 13 : Know the differences Between type and interface

- Selon l’auteur, la convention consistant à mettre un I à chaque interface en TypeScript est considéré aujourd’hui comme une mauvaise pratique (inutile, apporte peu de valeur etc.).
- Une interface peut étendre un type, et un type peut étendre une interface :
  `interface StateWithPop extends State {
  population: number;
}
type StateWithPop = State & { population: number; };`
- **Une classe peut implémenter un type** comme elle peut implémenter un interface.
  ```typescript
  class State implements TypeState {
    // [...]
  }
  ```
- De manière générale, **un type offre plus de possibilités qu’une interface**. Par exemple l'utilisation d’unions.
  - Un exemple notable est le **declaration merging** qui permet d’augmenter une interface sans changer son nom.
    ```typescript
    interface State {
      name: string;
    }
    interface State {
      population: number;
    }
    const wyoming: State = {
      name: "Wyoming",
      population: 500_000,
    };
    ```
- Pour le **choix entre type et interface**, l’auteur conseille de se baser sur :
  - La consistance au sein de la codebase.
  - Le fait qu’on ait besoin ou non que d’autres personnes puissent augmenter nos types.

### Item 14 : Use Type Operations and Generics to Avoid Repeating Yourself

- Il existe de nombreuses techniques pour **éviter la duplication de type** :
  - 1 - Extraire la duplication dans un sous-type.
  - 2 - Dans le cas de deux fonctions qui ont la même signature, créer un type de fonction, et l’utiliser pour les typer sous forme de _function expressions_ (cf. Item 12).
  - 3 - Dans le cas où on a un type objet qui reprend **une partie des propriétés d’un autre type**, et qu’on veut garder ce lien sans extraire un sous-type :
    - Par exemple, on _State_, et _TopNavState_ qu’on veut dépendre d’une partie de _State_ :
      ````typescript
      type State = {
        userId: string;
        pageTitle: string;
        recentFiles: string[];
      }
      type TopNavState = {
        userId: string;
        pageTitle: string;
      }```
      ````
    - On va pouvoir utiliser un mapped type :
      ```typescript
      type TopNavState = {
        [k in "userId" | "pageTitle"]: State[k];
      };
      ```
    - Ou encore l’équivalent avec `Pick` :
      ```typescript
      type TopNavState = Pick<State, "userId" | "pageTitle">;
      ```
  - 4 - Dans le cas où on veut le même type objet qui existe mais avec **tous les attributs optionnels** :
    - Par exemple pour le même type State, on peut utiliser un mapped type :
      ```typescript
      type OptionalState = {
        [k in keyof State]?: State[k];
      };
      ```
    - Ou encore l’équivalent avec `Partial` :
      ```typescript
      type OptionalState = Partial<State>;
      ```
  - 5 - Si on veut récupérer la **valeur de retour inférée d’une fonction** dans un type à réutiliser ailleurs, on peut le faire avec `ReturnType` :
    ```typescript
    type UserInfo = ReturnType<typeof getUserInfo>;
    ```

### Item 15 : Use Index Signatures for Dynamic Data

- Les **index signatures** doivent être utilisées seulement dans le cas où la donnée est dynamique et **qu’on ne connaît pas les attributs d’un objet à la transpilation**.
  - Exemple :
    ```typescript
    type State = {
      [property: string]: string;
    };
    ```
- Sinon, il faut utiliser des types plus précis.
  - Typer intégralement l’objet.
  - Ajouter undefined aux propriétés peut ajouter un peu de safety en obligeant à vérifier leur présence.
    ```typescript
    type State = {
      [property: string]: string | undefined;
    };
    ```
  - Utiliser `Record` peut permettre d’être plus précis sur les noms de clés.
    ```typescript
    type State = Record<"userId" | "pageTitle", string>;
    ```
- NDLR : l’auteur n’en parle pas, mais souvent on va vouloir parser la donnée…

### Item 16 : Prefer Arrays, Tuples, and ArrayLike to number Index Signatures

- Les **objets JavaScript** sont représentés par des collections de clés / valeurs, **avec les clés ne pouvant être que des strings** (ou des symbols depuis ES6), et les valeurs n’importe quoi.
  - Dans le cas où on donne autre chose en clé, ce sera converti en string avec l’appel à `toString()`, y compris pour un `number` par exemple.
  - Les **arrays** sont des objets aussi. On les indexe par des entiers, mais ils sont convertis **automatiquement en strings** par JavaScript.
  - TypeScript type l’index des _arrays_ comme des `number` pour éviter au maximum les erreurs.
- Pour toutes ces raisons :
  - Il faut éviter les `for..in` pour les _arrays_.
  - Il faut de manière générale **éviter les numbers en tant que clé d’objet**, puisque ce sera converti de toute façon en string par JavaScript. A la place on peut soit :
    - Utiliser `string` ou `symbol`.
    - Utiliser un type _array_, par exemple : `Array`, `MonType[]`.
    - Utiliser un type _tuple_, par exemple : `[number, number]`.
    - Ou encore utiliser `ArrayLike` qui permet de désigner seulement les caractéristiques basiques d’un array (pouvoir accéder aux attributs par un index numérique et l’attribut _length_), sans les autres attributs du prototype.

### Item 17 : Use readonly to Avoid Errors Associated with Mutation

- **readonly** permet d’indiquer qu’une variable ou un paramètre ne pourra pas être modifié. **L’auteur conseille de l’utiliser dès que possible**.
  - Une valeur _readonly_ peut être passée à une valeur mutable, mais pas l’inverse.
    - Ca a l’avantage d’être “contaminant” : si une de nos fonctions appelle une autre fonction en lui donnant une valeur qu’on n’a pas le droit de toucher, il faudra que l’autre fonction prenne aussi un paramètre _readonly_.
    - Dans le cas où on appelle des librairies sur lesquelles on n’a pas la main, on pourra toujours faire des _type assertions_ avec `as`.
- `readonly` est par nature “shallow”, c’est à dire qu’**il n’agit que sur un niveau**.
  - Par exemple :
    ```typescript
    const dates = readonly Date[];
    dates.push(new Date); // Error
    dates[0].setFullYear(2037); // OK
    ```
  - Il n’y a pas de version récursive de `readonly` dans la librairie standard, mais on peut par exemple trouver `DeepReadonly` dans une librairie comme _ts-essentials_.

### Item 18 : Use Mapped Types to Keep Values in Sync

- On peut **obliger un objet à avoir les mêmes attributs qu’un autre type** en utilisant un **mapped type**.
  ```typescript
  type ScatterProps = {
    x: number[];
    y: number[];
  };
  const REQUIRES_UPDATE: {[k in keyof ScatterProps]: boolean} = {
    x: true;
    y: false;
    // Si on ajoute 'y', on aura une erreur
  }
  ```

## 3 - Type Inference

### Item 19 : Avoid Cluttering Your Code with Inferable Types

- **Il ne faut pas ajouter des types partout**, mais plutôt en ajouter juste assez pour permettre à TypeScript de tout typer par inférence.
  - Ça permet notamment de faciliter le refactoring.
  - Du code TypeScript idéal va typer la signature des fonctions, mais pas les variables créés dans ces fonctions.
  - Dans certains cas quand on donne une lambda fonction il n’y a même pas besoin de typer ses paramètres qui seront inférés.
- Parmi les cas où il faut **typer quand même** :
  - Dans certains cas, on voudra faire une _type declaration_ pour éviter les erreurs dès la définition de l’objet, grâce à l’_excess property checking_.
  - Annoter le type de retour d’une fonction peut aussi être parfois utile :
    - Ne pas faire fuiter les erreurs vers les appelants.
    - Spécifier le contrat d’une fonction avant même de l’implémenter.
    - Etre cohérent dans certains cas où la fonction va par exemple prendre un type en paramètre et retourner le même type.
- Il existe une règle eslint qui s’appelle _no-inferrable-types_, et qui permet d’éviter les types qui pourraient être inférés..

### Item 20 : Use Different Variables for Different Types

- Il faut **éviter de réutiliser** une même variable pour porter une valeur d’un **autre type**.
  - Au lieu de ça, on pourrait typer avec un type plus large, mais la meilleure solution est de créer deux variables.

### Item 21 : Understand Type Widening

- Chaque variable doit avoir un seul type, et ce type est déterminé par typescript au mieux au moment de la déclaration : c’est le **type widening**.
- Le _type widening_ peut **être contrôlé** par certaines techniques :
  - Déclarer une variable comme **const** plutôt que **let** permet d’avoir un _type widening_ moins important.
  - On peut utiliser une **type declaration** pour spécifier un type spécifique plus précis pour un objet ou un tableau.
  - On peut utiliser la **type assertion** `as const` pour obtenir le type le plus précis possible (sans _type widening_ du tout).

### Item 22 : Understand Type Narrowing

- TypeScript rend les types plus précis, notamment avec des **type guards**.
  - Ça marche avec la condition de vérité (pour évacuer `null` et `undefined`).
  - Ça marche avec une condition sur `instanceof`.
  - Ça marche avec le check l'attribut : `"attr" in object`.
  - Ça marche avec `Array.isArray()`.
  - Il faut faire attention avec les comportements qui seraient contre-intuitifs en JavaScript, TypeScript les suit aussi.
    - Par exemple `if(!x) { ... }` pourrait mener à x ayant pour type `string | number | null | undefined`.
- Un autre moyen de rendre le type plus précis est l’utilisation d’**objets avec tag**
  ```typescript
  switch (object.type) {
    case "download":
      object; // de type Download
      break;
    case "upload":
      object; // de type Upload
      break;
  }
  ```
- On peut aussi définir des **custom type guards**.
  ```typescript
  function isInputElement(el: HTMLElement): el is HTMLInputElement {
    return "value" in el;
  }
  ```
- Si on veut que **filter donne le bon type**, on peut utiliser un custom type guard plutôt qu'une callback normale.
  ```typescript
  function isDefined<T>(x: T | undefined): x is T {
    return x !== undefined;
  }
  const members = ["Janet", "Michael", undefined].filter(isDefined);
  ```

### Item 23 : Create Objects All at Once

- Il vaut mieux **créer les objets d’un coup** quand c’est possible.
  - Créer un objet partiel assigne un type à la variable, et l’ajout de propriété plus tard devient plus compliqué.
- Une des techniques pour aider à créer un objet d’un coup est le spread operator `...`
  - On peut construire un objet à partir de plusieurs autres :
    ```typescript
    const namedPoint = { ...pt, ...id };
    ```
  - On peut construire des **variables intermédiaires avec un type partiel** de notre objet final :
    ```typescript
    const pt0 = {};
    const pt1 = { ...pt0, x: 3 };
    const pt: Point = { ...pt1, y: 4 };
    ```
  - Dans le cas où on veut des **propriétés conditionnelles**, on peut utiliser un petit utilitaire :
    ```typescript
    function addOptional&lt;T extends object, U extends object>(
      a: T, b: U | null
    ): T & Partial&lt;U> {
      return {...a, ...b};
    }
    const president = addOptional(firstLast, hasMiddle ? {middle: 'S'} : null);
    president.middle // string | undefined
    ```

### Item 24 : Be Consistent in Your Use of Aliases

- Quand on crée une variable servant de référence à une autre valeur (aliasing), il faut s’assurer qu’on utilise les type guards sur cette valeur pour rester consistant avec la suite du code.
  ```typescript
  const { bbox } = polygon;
  if (bbox) {
    const { x, y } = bbox;
  }
  ```
- Quand on utilise un type guard sur un objet, et qu’on appelle une fonction l’objet qu’on a vérifié, cette fonction pourrait altérer l’objet, mais TypeScript fait le choix de ne pas invalider le type guard à chaque appel de fonction.

### Item 25 : Use async Functions Instead of Callbacks for Asynchronous Code

- Il vaut mieux utiliser les promesses avec `async` / `await` que les promesses à l’ancienne ou même les callbacks asynchrones.
  - La syntaxe est plus concise et infère mieux les types.
  - Ca force une fonction à être **soit synchrone soit asynchrone, mais pas l’une ou l’autre conditionnellement**. De cette manière on sait comment l’appeler.
- On peut utiliser `Promise.race()` qui termine dès qu’une des promesses termine, pour mettre en place un timeout :
  ```typescript
  function timeout(millis: number): Promise&lt;never> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('timeout'), millis);
    });
  }
  await Promise.race([fetch(url), timeout(ms)]);
  ```

### Item 26 : Understand How Context Is Used in Type Inference

- En général TypeScript va **inférer le type d’une valeur à sa création**. Si on l’utilise plus tard dans un autre contexte (par exemple après qu’on l'ait placée dans une variable intermédiaire), l’inférence peut être mauvaise vis-à-vis de l’utilisation finale.
  - Le contexte est conservé par exemple pour :
    - Les types **string littéraux**, qui sinon vont plutôt être inférés en string général dans le cas d’une déclaration dans une variable let.
    - Les types **tuple**, qui sinon vont plutôt être inférés en tableau dans le cas d’une déclaration dans une variable let.
    - Les **objets** contenant des strings littéraux ou des tuples.
    - Les **callbacks** dont on n’a pas besoin de fournir le type des paramètres quand ils sont directement fournis à la fonction.
- Pour corriger le type en cas de perte de contexte, on va en général :
  - 1 - Utiliser une **_type declaration_** pour contraindre la valeur au type de notre choix.
  - 2 - Utiliser la **_const assertion_** `as const` pour contraindre la valeur au plus précis.
    - Attention par contre : ça va transformer la valeur en _deeply constant_. Une solution peut être de propager ce comportement dans les endroits où on passe la valeur.

### Item 27 : Use Functional Constructs and Libraries to Help Types Flow

- Il vaut mieux **utiliser les fonctions built-in et les librairies externes** (par exemple Lodash, Ramda etc.) **plutôt que de coder les choses à la main**. Ce sera plus lisible et mieux typé.
  - JavaScript n’a pas vraiment de librairie standard, les librairies externes jouent en grande partie ce rôle, et TypeScript a été construit pour les supporter.
- `.flat()` sur un tableau multidimensionnel permet de le transformer en tableau à une dimension.
- Lodash permet de chaîner des appels à ses fonctions utilitaires en donnant la valeur à la fonction `_`, puis permet de réobtenir la valeur finale avec `.value()`.
  - On aura `_(v).a().b().c().value()` :
    ```typescript
    _(vallPlayers)
      .groupBy((player) => player.team)
      .mapValues((players) => _.maxBy(players, (p) => p.salary))
      .values();
    ```

## 4 - Type Design
