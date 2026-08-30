const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1150" width="100%" height="100%" style="background-color: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <style>
      .table-box { fill: #1e293b; stroke: #334155; stroke-width: 2; rx: 8; filter: url(#shadow); }
      .header-user { fill: #3b82f6; }
      .header-course { fill: #8b5cf6; }
      .header-blog { fill: #ec4899; }
      .header-enroll { fill: #10b981; }
      .header-lesson { fill: #06b6d4; }
      .header-quiz { fill: #f59e0b; }
      .header-result { fill: #6366f1; }
      .header-quest { fill: #14b8a6; }
      .header-option { fill: #84cc16; }
      .header-ans { fill: #a855f7; }
      .title-text { fill: #ffffff; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; }
      .sub-title { fill: #94a3b8; font-size: 11px; }
      .col-name { fill: #f8fafc; font-size: 12px; font-family: monospace; }
      .col-type { fill: #94a3b8; font-size: 11px; font-family: monospace; }
      .badge-pk { fill: #ef4444; font-size: 10px; font-weight: bold; }
      .badge-fk { fill: #eab308; font-size: 10px; font-weight: bold; }
      .badge-uk { fill: #3b82f6; font-size: 10px; font-weight: bold; }
      .line { stroke: #64748b; stroke-width: 2; stroke-dasharray: 4,4; }
      .line-solid { stroke: #38bdf8; stroke-width: 2; }
      .grid-line { stroke: #334155; stroke-width: 1; opacity: 0.2; }
    </style>
  </defs>

  <!-- Title -->
  <text x="800" y="45" text-anchor="middle" fill="#f8fafc" font-size="24" font-weight="bold" letter-spacing="1">CPS LMS - Entity Relationship Diagram (ERD)</text>
  <text x="800" y="70" text-anchor="middle" fill="#64748b" font-size="14">Strapi v5 Database Schema &amp; Relational Architecture</text>

  <!-- Connections -->
  <!-- USER -> BLOG_POST -->
  <path d="M 610 200 L 320 200" stroke="#ec4899" stroke-width="2.5" fill="none" marker-end="url(#arrow)"/>
  
  <!-- USER -> COURSE (instructor & content_manager) -->
  <path d="M 910 180 L 1150 180" stroke="#8b5cf6" stroke-width="2.5" fill="none"/>
  <path d="M 910 240 L 1150 240" stroke="#8b5cf6" stroke-dasharray="4,4" stroke-width="2" fill="none"/>

  <!-- USER -> ENROLLMENT -->
  <path d="M 610 280 L 160 520" stroke="#10b981" stroke-width="2" fill="none"/>

  <!-- USER -> LESSON_PROGRESS -->
  <path d="M 650 320 L 450 520" stroke="#06b6d4" stroke-width="2" fill="none"/>

  <!-- USER -> QUIZ (created_by) -->
  <path d="M 870 320 L 1000 520" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4" fill="none"/>

  <!-- COURSE -> LESSON -->
  <path d="M 1250 340 L 730 520" stroke="#06b6d4" stroke-width="2.5" fill="none"/>

  <!-- COURSE -> QUIZ -->
  <path d="M 1300 340 L 1050 520" stroke="#f59e0b" stroke-width="2.5" fill="none"/>

  <!-- COURSE -> ENROLLMENT -->
  <path d="M 1150 300 L 260 520" stroke="#10b981" stroke-width="2" fill="none"/>

  <!-- COURSE -> LESSON_PROGRESS -->
  <path d="M 1200 320 L 520 520" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4,4" fill="none"/>

  <!-- LESSON -> LESSON_PROGRESS -->
  <path d="M 650 620 L 550 620" stroke="#06b6d4" stroke-width="2" fill="none"/>

  <!-- QUIZ -> QUESTION -->
  <path d="M 1000 710 L 800 870" stroke="#14b8a6" stroke-width="2.5" fill="none"/>

  <!-- QUIZ -> QUIZ_RESULT -->
  <path d="M 1150 620 L 1280 620" stroke="#6366f1" stroke-width="2.5" fill="none"/>

  <!-- QUESTION -> OPTION -->
  <path d="M 630 960 L 460 960" stroke="#84cc16" stroke-width="2.5" fill="none"/>

  <!-- QUESTION -> QUIZ_ANSWER -->
  <path d="M 800 1000 L 1150 960" stroke="#a855f7" stroke-width="2" fill="none"/>

  <!-- QUIZ_RESULT -> QUIZ_ANSWER -->
  <path d="M 1380 790 L 1380 870" stroke="#a855f7" stroke-width="2.5" fill="none"/>

  <!-- OPTION -> QUIZ_ANSWER -->
  <path d="M 460 1000 L 1150 1000" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4" fill="none"/>

  <!-- 1. BLOG_POST -->
  <g transform="translate(60, 110)">
    <rect class="table-box" width="260" height="230"/>
    <rect class="header-blog" width="260" height="35" rx="8" ry="8"/>
    <rect class="header-blog" y="20" width="260" height="15"/>
    <text x="130" y="23" class="title-text" text-anchor="middle">BLOG_POST</text>
    <text x="15" y="55" class="col-name">id</text><text x="140" y="55" class="col-type">UUID</text><text x="230" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">title</text><text x="140" y="75" class="col-type">string</text>
    <text x="15" y="95" class="col-name">body</text><text x="140" y="95" class="col-type">richtext</text>
    <text x="15" y="115" class="col-name">cover_image_url</text><text x="140" y="115" class="col-type">string (NULL)</text>
    <text x="15" y="135" class="col-name">status</text><text x="140" y="135" class="col-type">blog_status</text>
    <text x="15" y="155" class="col-name">author_id</text><text x="140" y="155" class="col-type">UUID</text><text x="230" y="155" class="badge-fk">FK</text>
    <text x="15" y="175" class="col-name">publishedAt</text><text x="140" y="175" class="col-type">datetime</text>
    <text x="15" y="195" class="col-name">createdAt</text><text x="140" y="195" class="col-type">datetime</text>
    <text x="15" y="215" class="col-name">updatedAt</text><text x="140" y="215" class="col-type">datetime</text>
  </g>

  <!-- 2. USER (Strapi Users) -->
  <g transform="translate(610, 100)">
    <rect class="table-box" width="300" height="210"/>
    <rect class="header-user" width="300" height="35" rx="8" ry="8"/>
    <rect class="header-user" y="20" width="300" height="15"/>
    <text x="150" y="23" class="title-text" text-anchor="middle">USER (Strapi Users)</text>
    <text x="15" y="55" class="col-name">id</text><text x="150" y="55" class="col-type">UUID</text><text x="265" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">username</text><text x="150" y="75" class="col-type">string</text>
    <text x="15" y="95" class="col-name">email</text><text x="150" y="95" class="col-type">string</text><text x="265" y="95" class="badge-uk">UK</text>
    <text x="15" y="115" class="col-name">role</text><text x="150" y="115" class="col-type">user_role</text>
    <text x="15" y="135" class="col-name">avatar</text><text x="150" y="135" class="col-type">string (NULL)</text>
    <text x="15" y="155" class="col-name">createdAt</text><text x="150" y="155" class="col-type">datetime</text>
    <text x="15" y="175" class="col-name">updatedAt</text><text x="150" y="175" class="col-type">datetime</text>
  </g>

  <!-- 3. COURSE -->
  <g transform="translate(1150, 110)">
    <rect class="table-box" width="300" height="230"/>
    <rect class="header-course" width="300" height="35" rx="8" ry="8"/>
    <rect class="header-course" y="20" width="300" height="15"/>
    <text x="150" y="23" class="title-text" text-anchor="middle">COURSE</text>
    <text x="15" y="55" class="col-name">id</text><text x="160" y="55" class="col-type">UUID</text><text x="265" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">title</text><text x="160" y="75" class="col-type">string</text>
    <text x="15" y="95" class="col-name">description</text><text x="160" y="95" class="col-type">text (NULL)</text>
    <text x="15" y="115" class="col-name">thumbnail_url</text><text x="160" y="115" class="col-type">string (NULL)</text>
    <text x="15" y="135" class="col-name">instructor_id</text><text x="160" y="135" class="col-type">UUID</text><text x="265" y="135" class="badge-fk">FK</text>
    <text x="15" y="155" class="col-name">content_manager_id</text><text x="160" y="155" class="col-type">UUID</text><text x="265" y="155" class="badge-fk">FK</text>
    <text x="15" y="175" class="col-name">createdAt</text><text x="160" y="175" class="col-type">datetime</text>
    <text x="15" y="195" class="col-name">updatedAt</text><text x="160" y="195" class="col-type">datetime</text>
  </g>

  <!-- 4. ENROLLMENT -->
  <g transform="translate(60, 520)">
    <rect class="table-box" width="260" height="210"/>
    <rect class="header-enroll" width="260" height="35" rx="8" ry="8"/>
    <rect class="header-enroll" y="20" width="260" height="15"/>
    <text x="130" y="23" class="title-text" text-anchor="middle">ENROLLMENT</text>
    <text x="15" y="55" class="col-name">id</text><text x="140" y="55" class="col-type">UUID</text><text x="230" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">student_id</text><text x="140" y="75" class="col-type">UUID</text><text x="230" y="75" class="badge-fk">FK</text>
    <text x="15" y="95" class="col-name">course_id</text><text x="140" y="95" class="col-type">UUID</text><text x="230" y="95" class="badge-fk">FK</text>
    <text x="15" y="115" class="col-name">status</text><text x="140" y="115" class="col-type">enrollment_status</text>
    <text x="15" y="135" class="col-name">enrolledAt</text><text x="140" y="135" class="col-type">datetime</text>
    <text x="15" y="155" class="col-name">completedAt</text><text x="140" y="155" class="col-type">datetime (NULL)</text>
    <text x="15" y="175" class="col-name">createdAt</text><text x="140" y="175" class="col-type">datetime</text>
    <text x="15" y="195" class="col-name">updatedAt</text><text x="140" y="195" class="col-type">datetime</text>
  </g>

  <!-- 5. LESSON_PROGRESS -->
  <g transform="translate(350, 520)">
    <rect class="table-box" width="260" height="210"/>
    <rect class="header-lesson" width="260" height="35" rx="8" ry="8"/>
    <rect class="header-lesson" y="20" width="260" height="15"/>
    <text x="130" y="23" class="title-text" text-anchor="middle">LESSON_PROGRESS</text>
    <text x="15" y="55" class="col-name">id</text><text x="140" y="55" class="col-type">UUID</text><text x="230" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">student_id</text><text x="140" y="75" class="col-type">UUID</text><text x="230" y="75" class="badge-fk">FK</text>
    <text x="15" y="95" class="col-name">course_id</text><text x="140" y="95" class="col-type">UUID</text><text x="230" y="95" class="badge-fk">FK</text>
    <text x="15" y="115" class="col-name">lesson_id</text><text x="140" y="115" class="col-type">UUID</text><text x="230" y="115" class="badge-fk">FK</text>
    <text x="15" y="135" class="col-name">completed</text><text x="140" y="135" class="col-type">boolean (false)</text>
    <text x="15" y="155" class="col-name">completedAt</text><text x="140" y="155" class="col-type">datetime (NULL)</text>
    <text x="15" y="175" class="col-name">createdAt</text><text x="140" y="175" class="col-type">datetime</text>
    <text x="15" y="195" class="col-name">updatedAt</text><text x="140" y="195" class="col-type">datetime</text>
  </g>

  <!-- 6. LESSON -->
  <g transform="translate(650, 520)">
    <rect class="table-box" width="250" height="210"/>
    <rect class="header-lesson" width="250" height="35" rx="8" ry="8"/>
    <rect class="header-lesson" y="20" width="250" height="15"/>
    <text x="125" y="23" class="title-text" text-anchor="middle">LESSON</text>
    <text x="15" y="55" class="col-name">id</text><text x="130" y="55" class="col-type">UUID</text><text x="220" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">title</text><text x="130" y="75" class="col-type">string</text>
    <text x="15" y="95" class="col-name">content</text><text x="130" y="95" class="col-type">richtext (NULL)</text>
    <text x="15" y="115" class="col-name">video_url</text><text x="130" y="115" class="col-type">string (NULL)</text>
    <text x="15" y="135" class="col-name">order</text><text x="130" y="135" class="col-type">integer</text>
    <text x="15" y="155" class="col-name">course_id</text><text x="130" y="155" class="col-type">UUID</text><text x="220" y="155" class="badge-fk">FK</text>
    <text x="15" y="175" class="col-name">createdAt</text><text x="130" y="175" class="col-type">datetime</text>
    <text x="15" y="195" class="col-name">updatedAt</text><text x="130" y="195" class="col-type">datetime</text>
  </g>

  <!-- 7. QUIZ -->
  <g transform="translate(930, 520)">
    <rect class="table-box" width="250" height="190"/>
    <rect class="header-quiz" width="250" height="35" rx="8" ry="8"/>
    <rect class="header-quiz" y="20" width="250" height="15"/>
    <text x="125" y="23" class="title-text" text-anchor="middle">QUIZ</text>
    <text x="15" y="55" class="col-name">id</text><text x="130" y="55" class="col-type">UUID</text><text x="220" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">title</text><text x="130" y="75" class="col-type">string</text>
    <text x="15" y="95" class="col-name">description</text><text x="130" y="95" class="col-type">text (NULL)</text>
    <text x="15" y="115" class="col-name">course_id</text><text x="130" y="115" class="col-type">UUID</text><text x="220" y="115" class="badge-fk">FK</text>
    <text x="15" y="135" class="col-name">created_by</text><text x="130" y="135" class="col-type">UUID</text><text x="220" y="135" class="badge-fk">FK</text>
    <text x="15" y="155" class="col-name">createdAt</text><text x="130" y="155" class="col-type">datetime</text>
    <text x="15" y="175" class="col-name">updatedAt</text><text x="130" y="175" class="col-type">datetime</text>
  </g>

  <!-- 8. QUIZ_RESULT -->
  <g transform="translate(1220, 520)">
    <rect class="table-box" width="280" height="270"/>
    <rect class="header-result" width="280" height="35" rx="8" ry="8"/>
    <rect class="header-result" y="20" width="280" height="15"/>
    <text x="140" y="23" class="title-text" text-anchor="middle">QUIZ_RESULT</text>
    <text x="15" y="55" class="col-name">id</text><text x="150" y="55" class="col-type">UUID</text><text x="250" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">student_id</text><text x="150" y="75" class="col-type">UUID</text><text x="250" y="75" class="badge-fk">FK</text>
    <text x="15" y="95" class="col-name">quiz_id</text><text x="150" y="95" class="col-type">UUID</text><text x="250" y="95" class="badge-fk">FK</text>
    <text x="15" y="115" class="col-name">attempt_no</text><text x="150" y="115" class="col-type">integer (1)</text>
    <text x="15" y="135" class="col-name">score</text><text x="150" y="135" class="col-type">integer</text>
    <text x="15" y="155" class="col-name">total_questions</text><text x="150" y="155" class="col-type">integer</text>
    <text x="15" y="175" class="col-name">percentage</text><text x="150" y="175" class="col-type">decimal(5,2)</text>
    <text x="15" y="195" class="col-name">submittedAt</text><text x="150" y="195" class="col-type">datetime</text>
    <text x="15" y="215" class="col-name">createdAt</text><text x="150" y="215" class="col-type">datetime</text>
    <text x="15" y="235" class="col-name">updatedAt</text><text x="150" y="235" class="col-type">datetime</text>
  </g>

  <!-- 9. QUESTION -->
  <g transform="translate(630, 870)">
    <rect class="table-box" width="250" height="170"/>
    <rect class="header-quest" width="250" height="35" rx="8" ry="8"/>
    <rect class="header-quest" y="20" width="250" height="15"/>
    <text x="125" y="23" class="title-text" text-anchor="middle">QUESTION</text>
    <text x="15" y="55" class="col-name">id</text><text x="130" y="55" class="col-type">UUID</text><text x="220" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">question</text><text x="130" y="75" class="col-type">text</text>
    <text x="15" y="95" class="col-name">order</text><text x="130" y="95" class="col-type">integer</text>
    <text x="15" y="115" class="col-name">quiz_id</text><text x="130" y="115" class="col-type">UUID</text><text x="220" y="115" class="badge-fk">FK</text>
    <text x="15" y="135" class="col-name">createdAt</text><text x="130" y="135" class="col-type">datetime</text>
    <text x="15" y="155" class="col-name">updatedAt</text><text x="130" y="155" class="col-type">datetime</text>
  </g>

  <!-- 10. OPTION -->
  <g transform="translate(210, 870)">
    <rect class="table-box" width="250" height="170"/>
    <rect class="header-option" width="250" height="35" rx="8" ry="8"/>
    <rect class="header-option" y="20" width="250" height="15"/>
    <text x="125" y="23" class="title-text" text-anchor="middle">OPTION</text>
    <text x="15" y="55" class="col-name">id</text><text x="130" y="55" class="col-type">UUID</text><text x="220" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">option_text</text><text x="130" y="75" class="col-type">text</text>
    <text x="15" y="95" class="col-name">is_correct</text><text x="130" y="95" class="col-type">boolean (false)</text>
    <text x="15" y="115" class="col-name">question_id</text><text x="130" y="115" class="col-type">UUID</text><text x="220" y="115" class="badge-fk">FK</text>
    <text x="15" y="135" class="col-name">createdAt</text><text x="130" y="135" class="col-type">datetime</text>
    <text x="15" y="155" class="col-name">updatedAt</text><text x="130" y="155" class="col-type">datetime</text>
  </g>

  <!-- 11. QUIZ_ANSWER -->
  <g transform="translate(1150, 870)">
    <rect class="table-box" width="290" height="170"/>
    <rect class="header-ans" width="290" height="35" rx="8" ry="8"/>
    <rect class="header-ans" y="20" width="290" height="15"/>
    <text x="145" y="23" class="title-text" text-anchor="middle">QUIZ_ANSWER</text>
    <text x="15" y="55" class="col-name">id</text><text x="160" y="55" class="col-type">UUID</text><text x="260" y="55" class="badge-pk">PK</text>
    <text x="15" y="75" class="col-name">quiz_result_id</text><text x="160" y="75" class="col-type">UUID</text><text x="260" y="75" class="badge-fk">FK</text>
    <text x="15" y="95" class="col-name">question_id</text><text x="160" y="95" class="col-type">UUID</text><text x="260" y="95" class="badge-fk">FK</text>
    <text x="15" y="115" class="col-name">selected_option_id</text><text x="160" y="115" class="col-type">UUID (NULL)</text><text x="260" y="115" class="badge-fk">FK</text>
    <text x="15" y="135" class="col-name">createdAt</text><text x="160" y="135" class="col-type">datetime</text>
    <text x="15" y="155" class="col-name">updatedAt</text><text x="160" y="155" class="col-type">datetime</text>
  </g>
</svg>`;

fs.mkdirSync(path.join(__dirname, '../docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../docs/erd.svg'), svgContent);
console.log("Successfully generated docs/erd.svg!");
