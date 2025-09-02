# About Our Weather System

Welcome to our advanced weather forecasting system!

## 一些想法
这是我第一次使用AI来创建一个项目，中间纯手写的代码很少。

### 关于AI

- 灵码智能助手其实比较好用的，感觉有点慢，但基本能用起来，目前还是免费。缺点是输入界面有问题，光标经常会落后于文字，这可能不是它的问题，有可能是fcitx的bug。
- gemini cli: 感觉更智能更快一点。但问题是用了一天后，就无法使用。
- 还有几个看了一下，没有试，主要是不知道免费的情况如何。比如trae, auggie cli. claud cli肯定不免费，据说是最好的。

### 关于nextjs
- 象我这样的业余项目，以部署为导向，希望利用github pages, cloud pages这样来部署。再更高级一点也许是使用vercel pages，或者cloudflare works。基于这个原因，需要了解ssr, isr,ssg, csr。ssr, isr都需要用到nextjs的服务功能，所以部署难度大。我一般就只能用ssg和csr,即服务器净态生成，和客户端渲染。
- nextjs确实是集成了太多东西，很方便但又很复杂。碰到一个问题是useEffect会加载两次，这个默认设置碰上限制每秒并发的请求数的api简直就很很坑。ai帮我找了个办法避开了。据说设置中也可以让它只加载一次。
- api限制每秒并发数问题：这个也困扰了很久。最后用bottlenecks库来限制并发数。

### supabase
- supabase是一个开源的数据服务，可以免费使用。确实好用。但首先要注意的是，每个表都要先创建policy。不然不会报错，也不能返回数据。

## Features

- Real-time weather data
- Forecast for multiple locations
- User-friendly interface
- Route-based weather information

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Supabase for data storage
-高德地图 API for weather data
- Tailwind CSS for styling

## How It Works

Our system retrieves weather data from 高德地图 API and displays it in an easy-to-understand format. Users can:
1. View weather for specific regions
2. Save frequently accessed routes
3. Get detailed forecasts for each location along a route

---

## Key Development Concepts Summary

### 1. Next.js: The Full-Stack Framework

*   **Server Components vs. Client Components (`'use client'`):** Your project uses both. The main page (`app/page.tsx`) is a Server Component, which is great for fetching initial data securely on the server. Pages that require user interaction and hooks like `useState` and `useEffect` (e.g., `app/allways/page.tsx`) must be declared as Client Components. Understanding this distinction is crucial for performance and functionality.
*   **API Security with Route Handlers:** The most critical improvement was moving the Amap API key from the client to a server-side Route Handler (`app/api/weather/route.ts`). **Never expose secret keys on the client side.** Route Handlers are the standard way to create a secure backend API within Next.js.
*   **Environment Variables (`NEXT_PUBLIC_`):** As we saw with the Supabase keys, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Any secret keys (like your Amap key or Supabase service key) should **not** have this prefix and must only be accessed in server-side code (Server Components, Route Handlers).
*   **Data Caching and Revalidation:** The main page uses `revalidatePath` in a Server Action to provide a "Refresh" button. This is a powerful Next.js feature that allows you to update server-rendered data on-demand without a full page reload, giving you the benefits of a static site with the dynamism of a server-rendered one.

### 2. TypeScript: Ensuring Code Quality

*   **Centralize Your Type Definitions:** We created `app/_lib/types.ts` to hold all shared interfaces like `WeatherData` and `SavedWay`. This is a best practice that prevents type duplication, makes your code easier to maintain, and ensures consistency across your application.
*   **Type Safety in Data Fetching:** Defining types for your API responses and database tables (like `WeatherData`) helps you catch potential errors at compile time, not runtime. It makes your code more predictable and easier to refactor.

### 3. Supabase: The Backend-as-a-Service

*   **Seamless Client-Side Data Management:** Supabase provides a simple client library that makes it easy to query your database directly from Client Components, as seen in the `allways` and `getway` pages. This is ideal for features that require real-time data or user-specific information.
*   **Abstract Your Data Logic:** We moved the Supabase queries out of the components and into dedicated functions within `supabaseClient.ts` (e.g., `getSavedWays`). This separation of concerns makes your components cleaner (focused on UI) and your data-fetching logic reusable and easier to manage.

### 4. Tailwind CSS: Utility-First Styling

*   **Rapid UI Development:** Tailwind allows you to build custom designs directly in your JSX without writing separate CSS files. This is excellent for rapid prototyping and keeping styles co-located with their components.
*   **Build Reusable, Styled Components:** The best way to use Tailwind in a React project is by creating small, reusable components (`WeatherCard`, `Loading`, `Error`, `Nav`). This ensures a consistent look and feel across your application and makes your UI easier to maintain.
