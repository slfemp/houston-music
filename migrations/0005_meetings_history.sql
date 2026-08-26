-- Migration number: 0005    Real meeting history (from board agendas/minutes — no fabricated data)
INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (1, '2023 Board Meeting — Listening Session Review + 2023 Planning', 'regular', 'adjourned', 1674000000000, 1674007200000, 'Houston City Hall, 901 Bagby St', 4, 7, NULL, 1674007200000, NULL, 'none', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 10, 'call_to_order', 'Welcome — Gracie Chavez, Music & Tourism Officer (MOCA); remarks from Chair Jason Woods', NULL, 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 20, 'report', 'Presentation: Listening Session Overview', 'Overall takeaways, review categories, top concerns, next steps (Gracie, 10 min)', 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 30, 'discussion', '2023 Challenges + Opportunities', 'Top challenges/opportunities for 2023; action plan and timeframe; subcommittees; number of community events and listening sessions; funding — sponsorships/partnerships and working with a nonprofit to administer funds', 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 40, 'action', 'Action Items', 'Majority vote on top 3-5 challenges/opportunities; determine next steps; schedule tentative events (sessions, workshops, panels, lectures); determine funding options; advise/report 2023 action plan to MOCA', 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 50, 'announcements', 'Additional Business + Upcoming Events', 'Houston Music History Timeline; El Dorado Ballroom Restoration — Preservation of Houston Landmarks panel; houston-music.live; Music Directory; Make Music Day June 21', 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 60, 'public_comment', 'Q&A', NULL, 'completed', 1674000000000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (1, 70, 'adjournment', 'Adjourn', NULL, 'completed', 1674000000000);
INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (2, '2024 Board Meeting — New Members Seated, Officer Elections', 'regular', 'adjourned', 1706140800000, 1706148000000, 'Houston City Hall, First Floor', 4, 7, NULL, 1706148000000, 'Attendance: Jason Woods, Lupe Olivares, Gracie Chavez, Dria Thornton, Mike (Frost) Moore, Marissa Saenz; Tracy DeJarnett (virtual). Absent: Anna Garza, Jagi Kaital, Jason Kane, Mark Austin.

New members welcomed: Dria Thornton, Mike Moore, Marissa Saenz (onboarded December 2023).

Officer elections: Tracy DeJarnett elected Board Secretary; Dria Thornton elected Treasurer.

2024 priorities set: fundraising, collaboration, music business development, music tourism, busking/street-performance permitting (post-Astroworld environment).

2023 recap: 422 listening-session respondents across the 2023 cycle; preservation focus documented El Dorado Ballroom and SugarHill Records.

Planned activations: pre-SXSW Houston event (March 7-9) and post-SXSW Music City Forum (March 17).', 'submitted', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 10, 'call_to_order', 'Welcome + new member introductions', NULL, 'completed', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 20, 'action', 'Officer elections', 'Board Secretary and Treasurer', 'completed', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 30, 'discussion', '2024 priorities', 'Fundraising, collaboration, music business development, music tourism, busking/permitting', 'completed', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 40, 'report', '2023 listening session recap', '422 respondents; El Dorado Ballroom + SugarHill Records preservation focus', 'completed', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 50, 'announcements', 'SXSW activations', 'Pre-SXSW event Mar 7-9; post-SXSW Music City Forum Mar 17', 'completed', 1706140800000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (2, 60, 'adjournment', 'Adjourn', NULL, 'completed', 1706140800000);
INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (3, '2025 Board Meeting — Officer Elections + 2025 Focus', 'regular', 'adjourned', 1736899200000, 1736906400000, 'Rukaz Kultura, 5503 Lawndale St', 4, 7, NULL, 1736906400000, 'Officer elections (per 2025 election rules — chair/vice-chair/treasurer every two years, secretary annually): Chair Jason Woods, Vice-Chair Marissa Saenz, Secretary Gracie Chavez, Treasurer Dria Thornton (through 2026).

Members + officers remaining for a second term through January 2027: Jason Woods, Ericka De Leon, Jagi Kaital, Marissa Saenz, Lupe Olivares. Terms expired January 2025: Mark Austin (Position 3), Tracy DeJarnett (Position 5).

2024 Listening Session review — top concerns: Music Business Development, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development.

2025 focus (majority vote, top 3): Music Business Development, Healthcare/Wellness, Funding/Grants. Programs to schedule April, June, August, plus an October listening session.

Gracie Chavez announced her departure from the City (Music Officer role) effective January 24, 2025; she continues as Board Founder.', 'submitted', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 10, 'call_to_order', 'Welcome + Updates — Music Officer Gracie Chavez + Chair Jason Woods', 'Guidelines + contact updates', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 20, 'report', 'Board + New Officials', 'Boards & Commissions terms; board terms; MOCA and officer terms', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 30, 'action', 'Action Item #1: Officer elections', 'Chair, Vice-Chair, Secretary (annual)', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 40, 'report', '2024 Listening Session Presentation', 'Takeaways and top concerns: Music Business Dev, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 50, 'discussion', '2025 Music Focus', 'Action plan, programming, community activations', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 60, 'action', 'Action Item #2: Vote top 3 topics', 'Schedule programs April, June, Aug + October listening session', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 70, 'announcements', 'Additional Business', 'TMO East Texas Region monthly chapter meetings; Houston Music Classifieds / band registry; houston-music.live; Music Directory value proposition', 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 80, 'public_comment', 'Q&A', NULL, 'completed', 1736899200000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (3, 90, 'adjournment', 'Adjourn', NULL, 'completed', 1736899200000);
INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (4, 'January 2026 Board Meeting — Recruits, Financials, 2026 Focus', 'regular', 'adjourned', 1768955400000, 1768962600000, 'Rukaz Kultura, 5503 Lawndale St + Zoom', 4, 7, 1768956360000, 1768962600000, 'MINUTES — Houston Music Advisory Board, January 20, 2026 (revised 01/23/26).

In attendance: Gracie Chavez, Jason Woods, Marissa Saenz, Lupe Olivares, Ericka De Leon. Virtual: Dria Thornton, Mike Moore. Not present: Jagi Kaital, Henry Guidry. Meeting called to order 6:46 pm; recorded in MeetGeek.

Updates: 2026 Guidelines updated (review highlighted sections; guidelines to be posted online).

Financial report (Treasurer Dria Thornton): balance $14,590.12. Outstanding: $1,000 — Artist Survey org partnership (Fresh Arts).

New board recruits: January elections (Secretary, Treasurer) delayed until new members onboard, Spring 2026. Four finalists identified for two vacancies: Alex Navarro, Alex La Rotta, Russel Reinhart, Grace Rodriguez. Interviews to be scheduled in February (Vice-Chair); prior to interviews, internal meeting of board officials on selection process and recommendations to the City / Mayor''s Office of Intergovernmental Relations.

2026 community focus — members elected to revisit the previous year''s top three concerns: Music Business Development, Healthcare/Wellness, Funding/Grants. Lupe: 2026 Wellness Music Fest in partnership with El Centro de Corazón.

Committees (terms to be defined by the Chairman): Healthcare — Gracie Chavez (Committee Chair) + Kam Franklin (ambassador). Fundraising — Dria Thornton (Committee Chair). Subcommittee members may be appointed by the Chairman or volunteer by area of expertise; community ambassador/ally terms and responsibilities to be defined.', 'submitted', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 10, 'call_to_order', 'Welcome + Updates — Gracie Chavez + Chair Jason Woods', 'Guidelines + contact updates', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 20, 'treasurer_report', 'Financial Report — Treasurer Dria Thornton', 'Balance $14,590.12; $1,000 outstanding (Fresh Arts artist survey partnership)', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 30, 'discussion', 'Selecting New Board Recruits', 'Terms (Jan 2027: Jason + Marissa; Jan 2026: Gracie + Dria); delay board elections; identify finalists for interviews; recommendation to City administrators', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 40, 'action', 'Action Item #1: Vote 2026 Music Priority Focus (top 3)', 'Music Business Dev, Healthcare/Wellness, Funding/Grants, Collaboration, Audience Development', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 50, 'discussion', 'Committees + Partnerships', 'Healthcare: Kam Franklin + Gracie Chavez; MESA (HCC) internships Spring 2026; Houston Music Classifieds / band registry; Music + Texas Music directories; social media management (IG @hmabtx, Boma proposal); houston-music.live domain switch; Indie Sync Bundles June/July; Fall 2026 listening session', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 60, 'discussion', 'Texas Music Office + City of Houston', 'Official city representation and nonprofit status', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 70, 'announcements', 'Additional Business', 'TMO East Texas Region monthly meetings; Sound Diplomacy Conference Feb 2-3, Los Angeles', 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 80, 'public_comment', 'Q&A', NULL, 'completed', 1768955400000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (4, 90, 'adjournment', 'Adjourn', NULL, 'completed', 1768955400000);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 3, 'present', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 1, 'present', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 2, 'present', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 9, 'present', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 5, 'present', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 4, 'remote', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 8, 'remote', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 7, 'absent', NULL);
INSERT INTO attendance (meeting_id, member_id, status, note) VALUES (4, 6, 'absent', NULL);
INSERT INTO meetings (id, title, type, status, starts_at, ends_at, location, quorum_required, seats_at_notice, called_to_order_at, adjourned_at, minutes_body, minutes_status, created_at) VALUES (5, 'August 2026 Board Meeting — Recruits, Fundraising, Website', 'regular', 'adjourned', 1787700600000, 1787707800000, 'Rukaz Kultura, 5503 Lawndale St', 4, 7, NULL, 1787707800000, NULL, 'none', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 10, 'call_to_order', 'Welcome + Updates — Chair Jason Woods', 'Guidelines + contact updates', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 20, 'treasurer_report', 'Financial Report — Treasurer Dria Thornton', NULL, 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 30, 'report', 'New Board Recruits Update — Vice-Chair Marissa Saenz', 'Boards & Commissions updates; recommendation to City administrators; finalists for consideration', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 40, 'report', '2026 Focus for Music Community — Gracie + Babygirl', 'Music Business Dev, Healthcare/Wellness, Funding/Grants', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 50, 'report', 'Social Media Management (IG @hmabtx) — Boma Curates', 'Key metrics; shared resources and opportunities; partnerships; effectiveness', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 60, 'discussion', 'Fundraising — Gracie + Dria', 'Budget review, expenses, income projections, cashflow forecast; committees; community allies and ambassadors', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 70, 'report', 'Website — Mike Frost', 'houston-music.live domain switch; consistently provide resources + opportunities for the music community', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 80, 'discussion', 'Action Plan Q3/Q4 2026', 'Programming; community activations; plan Fall 2026 listening session', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 90, 'discussion', 'Texas Music Office + COH', 'Official city representation and nonprofit status; COH Office of the Arts Director Michele Leal', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 100, 'announcements', 'Additional Business', 'TMO East Texas Region monthly meetings; TMO Texas Sounds & Cities Conference Nov 5-6, Dallas', 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 110, 'public_comment', 'Q&A', NULL, 'completed', 1787700600000);
INSERT INTO agenda_items (meeting_id, position, kind, title, description, status, created_at) VALUES (5, 120, 'adjournment', 'Adjourn', NULL, 'completed', 1787700600000);
