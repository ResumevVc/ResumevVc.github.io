import React, { forwardRef } from 'react';

const ResumePDFTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const getBullets = (item, prop) => Array.isArray(item[prop]) ? item[prop] : (typeof item[prop] === 'string' ? item[prop].split('\n').filter(l => l.trim()) : []);

  return (
    <div ref={ref} className="bg-white text-black font-sans w-[8.5in] min-h-[11in] mx-auto p-[0.75in] box-border" style={{ fontFamily: '"Arial", "Helvetica", sans-serif' }}>
      
      {/* Header Info */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-normal tracking-wide uppercase mb-2" style={{ fontFamily: '"Georgia", serif' }}>
          {data.name || 'FIRST LAST'}
        </h1>
        <div className="text-sm text-gray-700 flex justify-center items-center flex-wrap gap-2">
          {data.location && <span>{data.location}</span>}
          {data.location && (data.phone || data.email || data.linkedin) && <span>•</span>}
          
          {data.phone && <span>P: {data.phone}</span>}
          {data.phone && (data.email || data.linkedin) && <span>•</span>}
          
          {data.email && <span>{data.email}</span>}
          {data.email && data.linkedin && <span>•</span>}
          
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {/* Professional Experience */}
      {(data.experience && data.experience.length > 0) && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold uppercase text-center tracking-widest mb-1 border-b border-black pb-1">
            Professional Experience
          </h2>
          <div className="mt-3 space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="text-[13px] leading-relaxed">
                <div className="flex justify-between font-normal mb-1">
                  <span>{exp.company || 'Company Name'}</span>
                  <span>{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</span>
                </div>
                <div className="font-bold italic mb-1">
                  {exp.role || 'Job Role'}
                </div>
                {getBullets(exp, 'description').length > 0 && (
                  <ul className="list-disc ml-5 pl-1 space-y-1 mt-1 font-normal break-words whitespace-pre-wrap">
                    {getBullets(exp, 'description').map((line, i) => (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {(data.projects && data.projects.length > 0) && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold uppercase text-center tracking-widest mb-1 border-b border-black pb-1">
            Projects
          </h2>
          <div className="mt-3 space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="text-[13px] leading-relaxed">
                <div className="font-bold mb-1">
                  {proj.name || 'Project Name'}
                </div>
                {getBullets(proj, 'description').length > 0 && (
                  <ul className="list-disc ml-5 pl-1 space-y-1 mt-1 font-normal break-words whitespace-pre-wrap">
                    {getBullets(proj, 'description').map((line, i) => (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {(data.education && data.education.length > 0) && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold uppercase text-center tracking-widest mb-1 border-b border-black pb-1">
            Education
          </h2>
          <div className="mt-3 space-y-4">
            {data.education.map((edu, idx) => (
              <div key={idx} className="text-[13px] leading-relaxed">
                <div className="flex justify-between font-normal mb-1">
                  <span>{edu.institution || 'University Name'}</span>
                  <span>{edu.graduationDate || edu.endDate}</span>
                </div>
                <div className="font-bold mb-1">
                  {edu.degree || 'Degree Title'}
                </div>
                {getBullets(edu, 'details').length > 0 && (
                  <ul className="list-disc ml-5 pl-1 space-y-1 mt-1 font-normal break-words whitespace-pre-wrap">
                    {getBullets(edu, 'details').map((line, i) => (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Other */}
      {(data.skills && data.skills.length > 0) && (
        <div>
          <h2 className="text-[13px] font-bold uppercase text-center tracking-widest mb-1 border-b border-black pb-1">
             Skills & Other
          </h2>
          <div className="mt-3 text-[13px] leading-relaxed font-normal flex flex-wrap gap-1">
            <span className="font-bold mr-1">Skills:</span>
            {data.skills.join(', ')}
          </div>
        </div>
      )}

    </div>
  );
});

ResumePDFTemplate.displayName = 'ResumePDFTemplate';
export default ResumePDFTemplate;
