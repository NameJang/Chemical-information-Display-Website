const UserloginDB = require('../Models/Userlogin.Models');

exports.verify = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // เรียก model เพื่อ verify
        const result = await UserloginDB.verify(Email, Password);
        if (result.success) {
            res.status(200).json({ message: 'Login successful' });
        } else if (result.reason === 'Email_NOT_FOUND') {
            res.status(404).json({ error: 'Email not found' });
        } else if (result.reason === 'Password_INCORRECT') {
            res.status(401).json({ error: 'Invalid Password' });
        }
    } catch (error) {
        console.error('Error during verification:', error);
        res.status(500).json({ error: 'Failed to verify userlogin' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        // Call the model to verify the employee
        const isVerified = await UserloginDB.updatePassword(Email, Password);
        if (isVerified) {
            res.status(200).json({ message: 'Update successful' });
        } else {
            res.status(401).json({ error: 'Update failed' });
        }
    } catch (error) {
        console.error('Error during update:', error);
        res.status(500).json({ error: 'Failed to update userlogin Password' });
    }
};