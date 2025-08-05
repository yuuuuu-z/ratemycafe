import React from "react";

export default function page() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <div
        className=" border-l-4 bg-yellow-300 border-yellow-500 text-yellow-700 p-4 mb-8"
        role="alert"
      >
        <p className="font-bold">Disclaimer</p>
        <p>
          This is for illustrative purposes only and is NOT legal advice. You
          must consult with a legal professional to draft a proper, legally
          binding document for your project.
        </p>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold  mb-6">
        Privacy Policy
      </h1>
      <p className=" mb-8 text-sm">Last updated: August 4, 2025</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold  mb-3">1. Introduction</h2>
          <p className=" leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how
            CafeRater collects, uses, and protects your personal information
            when you use our Service.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold  mb-3">
            2. Information We Collect
          </h2>
          <ul className="list-disc list-inside  leading-relaxed space-y-2">
            <li>
              <strong>Account Information:</strong> When you create an account,
              we collect your email address and a secure, hashed password, which
              are managed by our third-party authentication provider (Supabase).
            </li>
            <li>
              <strong>Profile Information:</strong> You may choose to provide a
              username and an avatar, which will be publicly displayed on your
              user profile and alongside your reviews.
            </li>
            <li>
              <strong>User Content:</strong> We collect and store all reviews,
              ratings, and other content you submit to the Service. This content
              is public and viewable by other users.
            </li>
            <li>
              <strong>Usage Data:</strong> We may collect non-identifying
              information about how you use the Service, such as pages visited,
              time spent, and device information, to improve our platform.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold  mb-3">
            3. How We Use Your Information
          </h2>
          <p className=" leading-relaxed mb-2">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside  leading-relaxed space-y-2">
            <li>Provide and operate the CafeRater Service.</li>
            <li>Display your reviews and ratings on the platform.</li>
            <li>
              Communicate with you regarding your account and the Service.
            </li>
            <li>Improve our platform and develop new features.</li>
            <li>Ensure the security and integrity of the Service.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold  mb-3">4. Data Security</h2>
          <p className="leading-relaxed">
            We take reasonable measures to protect your personal information
            from unauthorized access, loss, or disclosure. However, no method of
            transmission over the internet or method of electronic storage is
            100% secure.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold  mb-3">5. Your Rights</h2>
          <p className=" leading-relaxed">
            You have the right to access, correct, or delete your personal
            information and content. You can do this by managing your account
            settings or by contacting us directly.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold  mb-3">
            6. Changes to this Policy
          </h2>
          <p className=" leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new policy on this page.
          </p>
        </div>
      </div>
    </div>
  );
}
