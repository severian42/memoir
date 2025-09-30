# The Living Memoir 📖

A web application designed to help people document and share their life stories through guided biographical interviews. Built to bridge relationships and preserve family history through structured storytelling.

**Live App**: https://living-memoir.vercel.app/

## 🎯 Purpose

This app was created from a personal need to connect more deeply with family members. Sometimes the most meaningful projects come from the most personal places - this one was born from wanting to understand my biological father's story and share my own in a structured, meaningful way.

Whether you're looking to:
- Bridge generational gaps with family members
- Heal or strengthen relationships through understanding
- Preserve family history for future generations  
- Create a lasting memoir of your own experiences

The Living Memoir provides the tools and guidance to make it happen.

## ✨ Features

### 📝 Guided Life Story Documentation
- **200+ Research-Based Questions** across all life stages
- **Structured Life Stages**: Ancestry, Childhood, Adolescence, Early Adulthood, Mid-Life, Later Years
- **Multiple Input Methods**: Type responses or record audio with live transcription
- **Photo Integration**: Add images to enhance your stories
- **Personal Journal**: Free-form writing space for additional thoughts

### 🔒 Privacy & Security
- **100% Serverless** - everything stays in your browser
- **No AI or LLMs** processing your personal stories
- **No Accounts Required** - no sign-ups, no tracking
- **Local Data Storage** with automatic backups
- **Complete Data Control** - export/import your data anytime

### 📄 Professional Output
- **Beautiful PDF Export** - Generate professionally formatted memoirs
- **Data Backup/Restore** - JSON export for safekeeping and sharing
- **Cross-Device Compatibility** - Works on desktop, tablet, and mobile
- **Offline Capable** - Continue working without internet

## 🧪 Testing the App

The app includes comprehensive testing tools to verify all functionality:

### Quick Testing Methods:
1. **Keyboard Shortcuts**:
   - `Ctrl+Shift+P` (or `Cmd+Shift+P`) - Populate with realistic sample memoir data
   - `Ctrl+Shift+T` (or `Cmd+Shift+T`) - Run comprehensive test suite
   - `Ctrl+Shift+C` (or `Cmd+Shift+C`) - Clear all data

2. **Welcome Guide** - First-time users see testing buttons to load sample data

3. **Console Logging** - Open browser dev tools to see detailed testing information

### What Gets Tested:
- ✅ **Data Persistence** - All answers survive browser refresh/restart
- ✅ **PDF Export** - Generates clean, readable memoir documents
- ✅ **Auto-Save** - Continuous data protection with visual status
- ✅ **Backup/Restore** - JSON export/import functionality
- ✅ **Cross-Browser** - Works in Chrome, Firefox, Safari, Edge
- ✅ **Performance** - Smooth operation even with extensive data

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

## 🚀 Development

### Setup
```bash
git clone [repository-url]
cd the-living-memoir
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Technical Stack
- **Frontend**: TypeScript, HTML5, CSS3
- **PDF Generation**: jsPDF + html2canvas
- **Storage**: localStorage + IndexedDB
- **Build Tool**: Vite
- **Audio Processing**: Web Speech API

## 🤝 Contributing

This is a personal project built to help families connect, but contributions are welcome. The codebase is designed to be privacy-first and completely serverless.

## 📄 License

Open source under the MIT License.

---

**"Every person has a story worth telling, and every story deserves to be heard."**

*Built with love to help families understand each other better* ❤️
