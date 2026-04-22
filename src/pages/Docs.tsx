import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Docs = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-6">Documentation</h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Comprehensive guides and API references for the ForgeVeda platform.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
                            <p className="text-muted-foreground mb-4">
                                Quick start guide to setting up your first chip design project.
                            </p>
                            <a href="#" className="text-primary hover:underline">Read Guide →</a>
                        </div>
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-semibold mb-2">Architecture Spec</h2>
                            <p className="text-muted-foreground mb-4">
                                Learn how to define constraints and performance metrics.
                            </p>
                            <a href="#" className="text-primary hover:underline">View Spec Format →</a>
                        </div>
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-semibold mb-2">RTL Generation</h2>
                            <p className="text-muted-foreground mb-4">
                                Understanding the AI-driven RTL generation process.
                            </p>
                            <a href="#" className="text-primary hover:underline">Learn More →</a>
                        </div>
                        <div className="glass-panel p-6 rounded-xl">
                            <h2 className="text-xl font-semibold mb-2">Verification Flow</h2>
                            <p className="text-muted-foreground mb-4">
                                How to run simulations and interpret coverage reports.
                            </p>
                            <a href="#" className="text-primary hover:underline">View Flow →</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Docs;
