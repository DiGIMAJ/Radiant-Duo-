-- Disable email confirmation for new users
UPDATE auth.config SET confirm_email = false WHERE id = 1;