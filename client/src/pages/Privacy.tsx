import React from "react";

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-invert">
        <p className="text-gray-300 mb-4">
          Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>Welcome to YMovies. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>We collect information that you provide directly to us, such as when you create an account, update your profile, use interactive features, or contact us. This may include:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Name and contact information</li>
          <li>Account credentials</li>
          <li>User preferences</li>
          <li>Watch history</li>
          <li>Ratings and reviews</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Personalize your experience</li>
          <li>Generate recommendations based on your viewing history</li>
          <li>Process and complete transactions</li>
          <li>Send administrative information, such as updates and security alerts</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at: 
          <a href="mailto:privacy@ymovies.example.com" className="text-red-500 ml-1">
            privacy@ymovies.example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Privacy;
