import React, { useState, useEffect } from "react";
import domtoimage from "dom-to-image";
import { jsPDF } from "jspdf";
import "./ResumePreview.css"; // Ensure this CSS file is styled to your preference

function ResumePreview() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8000/resume/fetch-latest-user-info/");
        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update content trimming logic
  const trimContent = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const downloadResume = async () => {
    const element = document.querySelector(".resume-container");
    const downloadButton = document.querySelector(".download-btn");

    // Temporarily hide the download button
    downloadButton.style.display = "none";

    try {
      const scale = 4; // For better quality
      const options = {
        quality: 1,
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${element.offsetWidth}px`,
          height: `${element.offsetHeight}px`,
        },
      };

      // Generate image from DOM
      const dataUrl = await domtoimage.toPng(element, options);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = 190; // A4 width in mm
      const pdfHeight = 270; // A4 height in mm

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("ATS_Resume.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      // Restore the button after PDF generation
      downloadButton.style.display = "block";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No data available.</div>;
  }

  return (
    <div className="resume-container">
      <div className="resume-header">
        <h1>{userData.personalInfo?.name || "N/A"}</h1>
        <p>
          {userData.personalInfo?.email || "N/A"} | {userData.personalInfo?.phone || "N/A"} |{" "}
          {userData.personalInfo?.address || "N/A"}
        </p>
      </div>

      <div className="resume-section professional-summary">
        <h2>Professional Summary</h2>
        <p>{userData.professionalSummary || "No professional summary provided."}</p>
      </div>

      <div className="resume-section">
        <h2>Education</h2>
        <ul>
          {userData.education && userData.education.length > 0 ? (
            userData.education.map((edu, index) => (
              <li key={index} className="education">
                <div>
                  <span className="degree">{edu.degree}</span>
                  <div className="institution">{edu.institution}</div>
                </div>
                <span className="date">{edu.year}</span>
              </li>
            ))
          ) : (
            <li>No education details available.</li>
          )}
        </ul>
      </div>

      <div className="resume-section">
        <h2>Certifications</h2>
        <ul>
          {userData.certifications && userData.certifications.length > 0 ? (
            userData.certifications.map((cert, index) => (
              <li key={index}>
                {cert.title}
                <span className="date">{cert.date}</span>
              </li>
            ))
          ) : (
            <li>No certifications listed.</li>
          )}
        </ul>
      </div>

      <div className="resume-section">
        <h2>Achievements</h2>
        <ul>
          {userData.achievements && userData.achievements.length > 0 ? (
            userData.achievements.map((achievement, index) => (
              <li key={index}>
                {achievement.title}
                <span className="date">{achievement.year}</span>
              </li>
            ))
          ) : (
            <li>No achievements listed.</li>
          )}
        </ul>
      </div>

      <div className="resume-section">
        <h2>Projects</h2>
        <ul>
          {userData.projects && userData.projects.length > 0 ? (
            userData.projects.map((project, index) => (
              <li key={index}>
                <span>
                  <strong>{project.title}</strong> - {project.description}
                </span>
                <span>{project.duration}</span>
              </li>
            ))
          ) : (
            <li>No projects listed.</li>
          )}
        </ul>
      </div>

      <div className="resume-section">
        <h2>Work Experience</h2>
        <ul>
          {userData.experience.map((exp, index) => (
            <li key={index} className="work">
              <div className="details">
                <strong>{exp.role}</strong> | <span>{exp.company}</span>
                <p className="description">{exp.description}</p>
              </div>
              <span className="date">{exp.duration}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="resume-section">
        <h2>Skills</h2>
        <p className="skills-list">
          {userData.skills && userData.skills.length > 0
            ? userData.skills.join(", ")
            : "No skills listed."}
        </p>
      </div>

      <div className="button-container">
        <button className="download-btn" onClick={downloadResume}>
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default ResumePreview;
