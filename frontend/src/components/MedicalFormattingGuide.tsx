'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface MedicalFormattingGuideProps {
  field: 'symptoms' | 'examination' | 'diagnosis' | 'treatment';
}

const FORMATTING_GUIDES = {
  symptoms: {
    title: "Symptoms & Examination Format",
    guidelines: [
      "Write symptoms under SYMPTOMS: section",
      "Write examination findings under EXAMINATION: section",
      "Use clear, concise medical terminology",
      "Document all relevant clinical findings"
    ],
    example: `SYMPTOMS:
Severe headache with nausea for 3 days
Pain 8/10, throbbing, photophobia
Vomiting 2x, dizziness

EXAMINATION:
Alert, oriented, appears uncomfortable
BP 140/90, HR 88, T 37.2°C
Neck stiffness present, no focal deficits
Pupils equal and reactive`
  },
  examination: {
    title: "Symptoms & Examination Format",
    guidelines: [
      "Write symptoms under SYMPTOMS: section",
      "Write examination findings under EXAMINATION: section",
      "Use clear, concise medical terminology",
      "Document all relevant clinical findings"
    ],
    example: `SYMPTOMS:
Severe headache with nausea for 3 days
Pain 8/10, throbbing, photophobia
Vomiting 2x, dizziness

EXAMINATION:
Alert, oriented, appears uncomfortable
BP 140/90, HR 88, T 37.2°C
Neck stiffness present, no focal deficits
Pupils equal and reactive`
  },
  diagnosis: {
    title: "Diagnosis Format",
    guidelines: [
      "State the primary diagnosis clearly",
      "List differential diagnoses if uncertain",
      "Include severity if applicable",
      "Use standard medical terminology"
    ],
    example: `Migraine headache with aura
Differential: Tension headache, cluster headache
Severity: Severe`
  },
  treatment: {
    title: "Treatment Plan Format",
    guidelines: [
      "Document immediate treatment given",
      "List medications with dosing (use Prescriptions tab for details)",
      "Include advice and follow-up instructions",
      "Note when patient should return"
    ],
    example: `Sumatriptan 50mg given IM
Prescribed sumatriptan 50mg PRN (see Prescriptions)
Rest in dark quiet room, hydration
Regular sleep schedule
Return if no improvement in 48hrs`
  }
};

export default function MedicalFormattingGuide({ field }: MedicalFormattingGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const guide = FORMATTING_GUIDES[field];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
      >
        <HelpCircle className="h-3 w-3 mr-1" />
        Formatting Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{guide.title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Guidelines:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {guide.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Example Format:</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {guide.example}
                  </pre>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Following this format ensures consistent documentation
                  and helps other healthcare providers quickly understand the patient's condition.
                </p>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}