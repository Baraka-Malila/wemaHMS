'use client';

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface MedicalFormattingGuideProps {
  field: 'symptoms' | 'examination' | 'diagnosis' | 'treatment';
}

const FORMATTING_GUIDES = {
  symptoms: {
    title: "Patient Symptoms Format",
    guidelines: [
      "Chief Complaint: Start with main reason for visit",
      "Duration: How long symptoms have been present",
      "Severity: Rate pain/discomfort (mild, moderate, severe)",
      "Associated symptoms: Other related symptoms",
      "Aggravating/Relieving factors: What makes it worse/better"
    ],
    example: `Chief Complaint: Severe headache with nausea
Duration: 3 days, started gradually
Severity: 8/10 pain, throbbing
Associated: Photophobia, vomiting (2x), dizziness
Aggravating: Bright lights, noise, movement
Relieving: Rest in dark room, minimal relief with paracetamol`
  },
  examination: {
    title: "Physical Examination Format",
    guidelines: [
      "General appearance: Alert, oriented, in pain/distress",
      "Vital signs: Record if measured",
      "Relevant systems: Focus on complaint-related findings",
      "Positive findings: Abnormal discoveries",
      "Negative findings: Important normal findings"
    ],
    example: `General: Alert, oriented, appears uncomfortable
Vital signs: BP 140/90, HR 88, T 37.2°C
Neurological: Neck stiffness present, no focal deficits
Eyes: Pupils equal and reactive, no papilledema
Cardiovascular: Regular rhythm, no murmurs
Skin: No rash, normal color`
  },
  diagnosis: {
    title: "Diagnosis Format",
    guidelines: [
      "Primary diagnosis: Most likely condition",
      "Differential: Other possible conditions if uncertain",
      "ICD-10 codes: If known/required",
      "Severity: Mild, moderate, severe",
      "Complications: Any present or risk factors"
    ],
    example: `Primary: Migraine headache with aura
Differential: Tension headache, cluster headache
Severity: Severe, impacting daily activities
Risk factors: Stress, irregular sleep pattern
No complications identified`
  },
  treatment: {
    title: "Treatment Plan Format",
    guidelines: [
      "Immediate treatment: What's given/done now",
      "Medications: Prescribed with dosing",
      "Non-pharmacological: Rest, diet, lifestyle changes",
      "Follow-up: When to return, monitoring needed",
      "Red flags: When to seek immediate care"
    ],
    example: `Immediate: Sumatriptan 50mg given IM
Medications: Prescribed sumatriptan 50mg tablets PRN
Non-pharm: Rest in dark quiet room, hydration
Lifestyle: Regular sleep schedule, stress management
Follow-up: Return if no improvement in 48hrs
Red flags: Worst headache ever, fever, confusion`
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