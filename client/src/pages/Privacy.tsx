import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                1. Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to YMovies. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                2. Information We Collect
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                We collect information that you provide directly to us, such as when you create an account, update your profile, use interactive features, or contact us. This may include:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Name and contact information
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Account credentials
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  User preferences
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Watch history
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Ratings and reviews
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">We use the information we collect to:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Provide, maintain, and improve our services
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Personalize your experience
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Generate recommendations based on your viewing history
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Process and complete transactions
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Send administrative information, such as updates and security alerts
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                4. Data Security
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                5. Your Rights
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Access and review your personal data
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Correct inaccurate or incomplete data
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Request deletion of your data
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-2">•</span>
                  Opt-out of certain data processing activities
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6 border-b border-gray-800 pb-2">
                6. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:{" "}
                <a 
                  href="mailto:privacy@ymovies.example.com" 
                  className="text-red-500 hover:text-red-400 transition-colors underline"
                >
                  privacy@ymovies.example.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
