import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const MAX_CERTIFICATIONS = 3;
const MAX_PROJECTS = 3;
const MAX_ACHIEVEMENTS = 3;
const MAX_EXPERIENCE = 3;
const MAX_EDUCATION = 2;
const PROFESSIONAL_SUMMARY_WORD_LIMIT = 35;

const skillsOptions = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "React", label: "React" },
  { value: "Django", label: "Django" },
  { value: "Node.js", label: "Node.js" },
];

function ResumeForm() {
  const [formData, setFormData] = useState({
    personalInfo: { name: "", email: "", phone: "", address: "" },
    professionalSummary: "",
    certifications: [{ title: "", date: "" }],
    projects: [{ title: "", description: "" }],
    achievements: [{ title: "", year: "" }],
    experience: [{ role: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", institution: "", year: "" }],
    skills: [],
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const loggedInUserEmail = localStorage.getItem("userEmail");
        if (!loggedInUserEmail) return;

        const response = await fetch(
          `http://localhost:8000/resume/fetch-latest-user-info/?email=${loggedInUserEmail}`
        );
        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (section, key, value) => {
    setFormData((prev) => {
      if (key === null || key === undefined) {
        // If no key is provided, treat `section` as the direct key to update
        return {
          ...prev,
          [section]: value,
        };
      }
      // For nested keys
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  };

  const handleArrayChange = (section, index, key, value) => {
    const updatedArray = [...formData[section]];
    updatedArray[index][key] = value;
    setFormData({ ...formData, [section]: updatedArray });
  };

  const addNewEntry = (section) => {
    const limits = {
      certifications: MAX_CERTIFICATIONS,
      projects: MAX_PROJECTS,
      achievements: MAX_ACHIEVEMENTS,
      experience: MAX_EXPERIENCE,
      education: MAX_EDUCATION,
    };

    if (formData[section].length >= limits[section]) return;

    const newEntry =
      section === "education"
        ? { degree: "", institution: "", year: "" }
        : section === "experience"
        ? { role: "", company: "", duration: "", description: "" }
        : { title: "", description: "" };

    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newEntry],
    }));
  };

  const deleteEntry = (section, index) => {
    const updatedArray = [...formData[section]];
    updatedArray.splice(index, 1);
    setFormData({ ...formData, [section]: updatedArray });
  };

  const handleSkillChange = (selectedOptions) => {
    setFormData({ ...formData, skills: selectedOptions || [] });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/resume/save-user-info/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Form submitted successfully!");
        navigate("/preview");
      } else {
        alert("Error submitting form");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">ATS Resume Creator</h2>

      {/* Personal Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Full Name *"
            value={formData.personalInfo.name}
            onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
          />
          <input
            type="email"
            className="border p-2 rounded w-full"
            placeholder="Email *"
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
          />
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Phone *"
            value={formData.personalInfo.phone}
            onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
          />
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Address"
            value={formData.personalInfo.address}
            onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
        <textarea
          className="border p-2 rounded w-full"
          placeholder={`Write a brief summary (Max ${PROFESSIONAL_SUMMARY_WORD_LIMIT} words)`}
          value={formData.professionalSummary || ""}
          onChange={(e) => handleInputChange("professionalSummary", null, e.target.value)}
        ></textarea>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Certifications</h3>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Certification Title"
              value={cert.title}
              onChange={(e) => handleArrayChange("certifications", index, "title", e.target.value)}
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Date (e.g., Jan 2021)"
              value={cert.date}
              onChange={(e) => handleArrayChange("certifications", index, "date", e.target.value)}
            />
            <button
              className="bg-red-500 text-white py-1 px-4 rounded"
              onClick={() => deleteEntry("certifications", index)}
            >
              Delete Certification
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => addNewEntry("certifications")}
        >
          Add Certification
        </button>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Skills</h3>
        <Select
          isMulti
          options={skillsOptions}
          onChange={handleSkillChange}
          value={formData.skills}
          placeholder="Select your skills"
        />
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Projects</h3>
        {formData.projects.map((project, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Project Title"
              value={project.title}
              onChange={(e) =>
                handleArrayChange("projects", index, "title", e.target.value)
              }
            />
            <textarea
              className="border p-2 rounded w-full mb-2"
              placeholder="Description (Max 35 words)"
              value={project.description}
              onChange={(e) =>
                handleArrayChange("projects", index, "description", e.target.value)
              }
            ></textarea>
            <button
              className="bg-red-500 text-white py-1 px-4 rounded"
              onClick={() => deleteEntry("projects", index)}
            >
              Delete Project
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => addNewEntry("projects")}
        >
          Add Project
        </button>
      </div>

      {/* Achievements */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Achievements (Max {MAX_ACHIEVEMENTS})</h3>
        {formData.achievements.map((ach, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Achievement"
              value={ach.title}
              onChange={(e) =>
                handleArrayChange("achievements", index, "title", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Year (e.g., Jan 2021)"
              value={ach.year}
              onChange={(e) =>
                handleArrayChange("achievements", index, "year", e.target.value)
              }
            />
            <button
              className="bg-red-500 text-white py-1 px-4 rounded"
              onClick={() => deleteEntry("achievements", index)}
            >
              Delete Achievement
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => addNewEntry("achievements")}
        >
          Add Achievement
        </button>
      </div>

      {/* Work Experience */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Work Experience (Max {MAX_EXPERIENCE})</h3>
        {formData.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Role"
              value={exp.role}
              onChange={(e) =>
                handleArrayChange("experience", index, "role", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Company"
              value={exp.company}
              onChange={(e) =>
                handleArrayChange("experience", index, "company", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Duration (e.g., Jan 2021 - Dec 2022)"
              value={exp.duration}
              onChange={(e) =>
                handleArrayChange("experience", index, "duration", e.target.value)
              }
            />
            <textarea
              className="border p-2 rounded w-full mb-2"
              placeholder="Work Description (Max 25 words)"
              value={exp.description}
              onChange={(e) =>
                handleArrayChange("experience", index, "description", e.target.value)
              }
            ></textarea>
            <button
              className="bg-red-500 text-white py-1 px-4 rounded"
              onClick={() => deleteEntry("experience", index)}
            >
              Delete Experience
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => addNewEntry("experience")}
        >
          Add Experience
        </button>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Education (Max {MAX_EDUCATION})</h3>
        {formData.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) =>
                handleArrayChange("education", index, "degree", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Institution"
              value={edu.institution}
              onChange={(e) =>
                handleArrayChange("education", index, "institution", e.target.value)
              }
            />
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Year (e.g., Jan 2021 - Jan 2025)"
              value={edu.year}
              onChange={(e) =>
                handleArrayChange("education", index, "year", e.target.value)
              }
            />
            <button
              className="bg-red-500 text-white py-1 px-4 rounded"
              onClick={() => deleteEntry("education", index)}
            >
              Delete Education
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => addNewEntry("education")}
        >
          Add Education
        </button>
      </div>


      <div className="text-center">
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
          onClick={() => setFormData({
            personalInfo: { name: "", email: "", phone: "", address: "" },
            professionalSummary: "",
            certifications: [{ title: "", date: "" }],
            skills: [],
          })}
        >
          Reset Form
        </button>
        <button
        className={`py-2 px-4 rounded text-white ${
          loading ? "bg-gray-400" : "bg-green-500"
        }`}
        onClick={handleSubmit}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4zm2 5.292V12H2.708A8.002 8.002 0 016 17.292z"
              ></path>
            </svg>
            Processing...
          </div>
        ) : (
          "Submit Resume"
        )}
      </button>
      </div>
    </div>
  );
}

export default ResumeForm;
