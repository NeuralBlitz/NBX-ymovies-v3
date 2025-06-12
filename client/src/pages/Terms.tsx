import React from "react";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-invert">
        <p className="text-gray-300 mb-4">
          Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using YMovies, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          YMovies provides personalized movie recommendations and related services. 
          We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information, 
          including your password, and for all activity that occurs under your account.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
        <p>You agree not to use the service to:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe the rights of others</li>
          <li>Attempt to gain unauthorized access to any part of the service</li>
          <li>Interfere with the proper working of the service</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
        <p>
          All content included in the service, such as text, graphics, logos, and software, 
          is the property of YMovies or its content suppliers and is protected by copyright and other laws.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Contact</h2>
        <p>
          If you have questions about these Terms of Service, please contact us at: 
          <a href="mailto:terms@ymovies.example.com" className="text-red-500 ml-1">
            terms@ymovies.example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Terms;
