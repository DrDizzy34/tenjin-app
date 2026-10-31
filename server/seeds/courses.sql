-- Starter course list. Safe to re-run: existing codes are skipped.
-- Run with: psql tenjin -f seeds/courses.sql

INSERT INTO courses (code, title) VALUES
    -- Computer Science, years 1-2
    ('CSCI 1030U', 'Introduction to Computer Science'),
    ('CSCI 1060U', 'Programming Workshop I'),
    ('CSCI 1061U', 'Programming Workshop II'),
    ('CSCI 2000U', 'Scientific Data Analysis'),
    ('CSCI 2010U', 'Data Structures'),
    ('CSCI 2020U', 'Software Systems Development and Integration'),
    ('CSCI 2040U', 'Software Design and Analysis'),
    ('CSCI 2050U', 'Computer Architecture I'),
    ('CSCI 2071U', 'Computational Science I'),
    ('CSCI 2110U', 'Discrete Mathematics for Computer Scientists'),

    -- Computer Science, years 3-4
    ('CSCI 3010U', 'Simulation and Modelling'),
    ('CSCI 3020U', 'Operating Systems'),
    ('CSCI 3030U', 'Database Systems and Concepts'),
    ('CSCI 3055U', 'Programming Languages'),
    ('CSCI 3060U', 'Software Quality Assurance'),
    ('CSCI 3070U', 'Analysis and Design of Algorithms'),
    ('CSCI 3090U', 'Computer Graphics and Visualization'),
    ('CSCI 3150U', 'Computer Networks'),
    ('CSCI 3230U', 'Web Application Development'),
    ('CSCI 3310U', 'Systems Programming'),
    ('CSCI 4020U', 'Compilers'),
    ('CSCI 4030U', 'Big Data Analytics'),
    ('CSCI 4040U', 'Ethics, Law and the Social Impacts of Computing'),
    ('CSCI 4050U', 'Machine Learning, Theory and Application'),
    ('CSCI 4100U', 'Mobile Devices'),
    ('CSCI 4610U', 'Artificial Intelligence'),
    ('CSCI 4620U', 'Human-Computer Interaction'),
    ('CSCI 4640U', 'Distributed Computing'),

    -- Math and statistics
    ('MATH 1000U', 'Introductory Calculus'),
    ('MATH 1010U', 'Calculus I'),
    ('MATH 1020U', 'Calculus II'),
    ('MATH 2015U', 'Calculus III'),
    ('MATH 2050U', 'Linear Algebra'),
    ('MATH 2060U', 'Differential Equations'),
    ('MATH 2080U', 'Discrete Mathematics'),
    ('MATH 3030U', 'Introduction to Probability Theory'),
    ('STAT 2010U', 'Statistics and Probability for Physical Science'),

    -- First-year science
    ('PHY 1010U', 'Physics I'),
    ('PHY 1020U', 'Physics II'),
    ('CHEM 1010U', 'Chemistry I'),
    ('CHEM 1020U', 'Chemistry II'),
    ('BIOL 1010U', 'Biology I: Molecular and Cellular Systems'),
    ('BIOL 1020U', 'Biology II: Diversity of Life and Principles of Ecology')
ON CONFLICT (code) DO NOTHING;