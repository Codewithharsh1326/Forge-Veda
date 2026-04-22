import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

const Enterprise = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">ForgeVeda Enterprise</h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Run ForgeVeda on-premise or in your private cloud. Enhanced security, dedicated support, and custom model fine-tuning.
                    </p>

                    <div className="flex justify-center gap-4 mb-16">
                        <Button size="lg">Contact Sales</Button>
                        <Button variant="outline" size="lg">View Pricing</Button>
                    </div>

                    <div className="text-left grid gap-8 md:grid-cols-3">
                        <div className="p-6 rounded-xl bg-muted/30 border border-border">
                            <h3 className="text-lg font-semibold mb-2">Private Deployment</h3>
                            <p className="text-sm text-muted-foreground">Keep your IP secure with full on-premise installation options.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-muted/30 border border-border">
                            <h3 className="text-lg font-semibold mb-2">Custom Models</h3>
                            <p className="text-sm text-muted-foreground">Fine-tune the architecture models on your proprietary internal data.</p>
                        </div>
                        <div className="p-6 rounded-xl bg-muted/30 border border-border">
                            <h3 className="text-lg font-semibold mb-2">SLA & Support</h3>
                            <p className="text-sm text-muted-foreground">24/7 priority support and guaranteed uptime SLAs.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Enterprise;
