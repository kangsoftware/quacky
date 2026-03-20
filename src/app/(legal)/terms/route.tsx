export async function GET() {

    return new Response(null, {
        status: 302,
        headers: {
            Location: "https://lkang.au/terms"
        }
    });
}
