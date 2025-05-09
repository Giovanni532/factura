import { NextRequest, NextResponse } from "next/server";
import { paths } from "./paths";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
    paths.auth.signIn,
    paths.auth.signUp,
    paths.auth.forgetPassword,
    paths.auth.resetPassword,
    paths.home,
    paths.public.help,
    paths.public.contact,
    paths.public.about,
    paths.public.pricing,
    paths.public.features,
    paths.public.privacy,
    paths.public.terms,
    paths.public.blog
];

// Vérifier si un chemin est public
const isPublicRoute = (path: string) => {
    return publicRoutes.some(route =>
        path === route || path.startsWith(`${route}/`)
    );
};

// Vérifier si un chemin fait partie du dashboard
const isDashboardRoute = (path: string) => {
    return path.startsWith('/dashboard');
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get the auth session token directly from request cookies
    const sessionToken = request.cookies.get("better-auth.session_token");
    const hasSession = !!sessionToken?.value;

    // 1. Si la route est publique, permettre l'accès sans restriction
    if (isPublicRoute(pathname)) {
        // Sauf si l'utilisateur est connecté et tente d'accéder aux pages d'authentification
        if (hasSession) {
            return NextResponse.redirect(new URL(paths.dashboard.home, request.url));
        }
        return NextResponse.next();
    }

    // 2. Si c'est une route du dashboard mais que l'utilisateur n'est pas connecté
    if (isDashboardRoute(pathname) && !hasSession) {
        // Stocker l'URL d'origine pour rediriger après connexion
        const url = new URL(paths.auth.signIn, request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // 4. Pour les API routes ou autres routes spéciales, laisser passer
    return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware s'applique
export const config = {
    matcher: [
        /*
         * Match toutes les routes sauf :
         * 1. /_next (Next.js internals)
         * 2. /api (API routes)
         * 3. /static (static files)
         * 4. /_vercel (Vercel internals)
         * 5. Toutes les ressources statiques (icônes, images, etc.)
         */
        '/((?!_next|api|static|_vercel|.*\\.|.*\\.svg$).*)',
    ],
};
