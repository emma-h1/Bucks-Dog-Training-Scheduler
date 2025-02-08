import bg from "../assets/dogRunning.jpeg"
import "./Home.css"
const bgStyle = {
    backgroundImage: `url(${bg})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    height: '90vh',
};

export default function Home() {
    return (
        <div style={bgStyle}>
            <div className="header">
            Unleash Your Dog's Potential
            </div>
    
            <div className="text">
            At Buck's Dog Training of Central NJ, we're not just dog trainers. We're dog lovers, just like you,
                and we believe in the transformative power of a balanced approach to dog training.
            </div>
        </div>
    )
}