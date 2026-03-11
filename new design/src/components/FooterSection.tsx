const footerLinks = {
  Product: ["Features", "AI Insights", "Telehealth", "Integrations", "Pricing"],
  Company: ["About", "Careers", "Blog", "Press", "Contact"],
  Security: ["HIPAA Compliance", "SOC 2", "Data Encryption", "Privacy Policy", "Terms of Service"],
  Resources: ["Documentation", "API Reference", "Case Studies", "Webinars", "Support"],
};

const FooterSection = () => {
  return (
    <footer className="relative border-t border-border/50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg btn-glow flex items-center justify-center">
                <span className="font-display font-bold text-sm text-accent-foreground">M</span>
              </div>
              <span className="font-display font-bold text-foreground">MediCare Pro</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered healthcare management for the modern hospital.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-foreground mb-4 text-sm">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 MediCare Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
