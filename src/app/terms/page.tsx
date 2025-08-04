import React from "react";

export default function page() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      <div className="bg-gray-100 p-6 rounded-lg mb-8 text-sm text-gray-700">
        <strong>Disclaimer:</strong> This is for illustrative purposes only and
        is NOT legal advice. You must consult with a legal professional to draft
        a proper, legally binding document for your project.
      </div>

      <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
      <p className="text-gray-600 mb-8">Last updated: August 4, 2025</p>

      <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
      <p className="mb-4">
        Welcome to RateMyCafe! These Terms of Service (Terms) govern your access
        to and use of the CafeRater website and services (Service). By accessing
        or using the Service, you agree to be bound by these Terms.
      </p>

      <h2 className="text-2xl font-semibold mb-3">2. User Obligations</h2>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          <strong>Accurate Information:</strong> You agree to provide accurate
          and complete information during registration and to keep this
          information up to date.
        </li>
        <li>
          <strong>Responsible Use:</strong> You are responsible for all activity
          that occurs under your account. You agree not to share your password
          with others.
        </li>
        <li>
          <strong>Review Integrity:</strong> You agree to post truthful and fair
          reviews based on your genuine experience. You will not post
          misleading, false, or fabricated information.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">
        3. Content Ownership & License
      </h2>
      <p className="mb-4">
        You retain all ownership rights to the reviews, ratings, and content you
        post on the Service (User Content). However, by submitting User Content,
        you grant CafeRater a worldwide, non-exclusive, royalty-free license to
        use, reproduce, modify, display, and distribute your User Content in
        connection with the Service and its promotion.
      </p>

      <h2 className="text-2xl font-semibold mb-3">4. Prohibited Conduct</h2>
      <p className="mb-4">You are prohibited from:</p>
      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>Using the Service for any illegal or unauthorized purpose.</li>
        <li>
          Posting spam, malicious software, or any content that is false,
          defamatory, harassing, or otherwise harmful.
        </li>
        <li>
          Attempting to gain unauthorized access to the Service, its servers, or
          user accounts.
        </li>
        <li>Infringing upon the intellectual property rights of others.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">
        5. Disclaimer of Warranties
      </h2>
      <p className="mb-4">
        The Service is provided as is and as available without any warranties of
        any kind. CafeRater does not guarantee that the Service will be
        uninterrupted, error-free, or secure. Your use of the Service is at your
        sole risk.
      </p>

      <h2 className="text-2xl font-semibold mb-3">
        6. Limitation of Liability
      </h2>
      <p className="mb-4">
        CafeRater will not be liable for any indirect, incidental, special, or
        consequential damages resulting from your use of the Service, even if we
        have been advised of the possibility of such damages.
      </p>

      <h2 className="text-2xl font-semibold mb-3">7. Termination</h2>
      <p className="mb-4">
        CafeRater reserves the right to suspend or terminate your account and
        access to the Service at our sole discretion, without notice, for any
        reason, including a breach of these Terms.
      </p>
    </div>
  );
}
