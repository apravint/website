import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';

interface CommandItem {
  name: string;
  syntax: string;
  category: 'Navigation' | 'Files' | 'System' | 'Processes' | 'Network' | 'Permissions';
  descriptionEn: string;
  descriptionTa: string;
  example: string;
  explanationEn: string;
  explanationTa: string;
}

@Component({
  selector: 'app-linux',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './linux.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./linux.component.scss']
})
export class LinuxComponent implements OnInit {
  private seo = inject(SeoService);
  private router = inject(Router);
  public translationService = inject(TranslationService);

  searchQuery = '';
  activeCategory = 'All';
  copiedCommandName = '';

  categories = ['All', 'Navigation', 'Files', 'System', 'Processes', 'Network', 'Permissions'];

  commandsList: CommandItem[] = [
    // Navigation
    {
      name: 'pwd',
      syntax: 'pwd',
      category: 'Navigation',
      descriptionEn: 'Print name of current/working directory',
      descriptionTa: 'தற்போதைய கோப்புறையின் பாதையைக் காட்டும்',
      example: 'pwd',
      explanationEn: 'Shows the full absolute path of the directory you are currently in.',
      explanationTa: 'நீங்கள் தற்போது இருக்கும் கோப்புறையின் முழு முகவரியைக் காட்டுகிறது.'
    },
    {
      name: 'ls',
      syntax: 'ls [options] [directory]',
      category: 'Navigation',
      descriptionEn: 'List directory contents',
      descriptionTa: 'கோப்புறையில் உள்ள கோப்புகளைப் பட்டியலிடும்',
      example: 'ls -la',
      explanationEn: 'Lists all files including hidden ones (-a) with detailed information (-l) like permissions and size.',
      explanationTa: 'அனுமதிகள் மற்றும் அளவுகள் போன்ற விவரங்களுடன் மறைக்கப்பட்ட கோப்புகளையும் பட்டியலிடுகிறது.'
    },
    {
      name: 'cd',
      syntax: 'cd [directory]',
      category: 'Navigation',
      descriptionEn: 'Change the working directory',
      descriptionTa: 'வேறு கோப்புறைக்கு நகர உதவும்',
      example: 'cd ..',
      explanationEn: 'Navigates to the parent directory. Use "cd ~" to go to the user home folder.',
      explanationTa: 'மேல் கோப்புறைக்குச் செல்கிறது. முகப்புத் தளத்திற்குச் செல்ல "cd ~" என்பதைப் பயன்படுத்தவும்.'
    },
    {
      name: 'find',
      syntax: 'find [path] [expression]',
      category: 'Navigation',
      descriptionEn: 'Search for files in a directory hierarchy',
      descriptionTa: 'குறிப்பிட்ட கோப்பு எங்குள்ளது எனத் தேடும்',
      example: 'find . -name "*.ts"',
      explanationEn: 'Searches recursively from the current folder (.) for files ending with the extension .ts.',
      explanationTa: 'தற்போதைய கோப்புறைக்குள் .ts என்று முடியும் அனைத்து கோப்புகளையும் தேடுகிறது.'
    },

    // File Operations
    {
      name: 'mkdir',
      syntax: 'mkdir [options] directory',
      category: 'Files',
      descriptionEn: 'Create a new directory',
      descriptionTa: 'புதிய கோப்புறையை உருவாக்கும்',
      example: 'mkdir projects',
      explanationEn: 'Creates a new empty folder named "projects" in the current directory.',
      explanationTa: 'தற்போதைய கோப்புறைக்குள் "projects" என்ற பெயரில் புதிய கோப்புறையை உருவாக்குகிறது.'
    },
    {
      name: 'touch',
      syntax: 'touch filename',
      category: 'Files',
      descriptionEn: 'Create an empty file or update timestamp',
      descriptionTa: 'புதிய காலியான கோப்பை உருவாக்கும்',
      example: 'touch index.html',
      explanationEn: 'Creates a new empty file named "index.html" if it does not already exist.',
      explanationTa: 'குறிப்பிட்ட பெயரில் புதிய காலியான கோப்பை உருவாக்குகிறது.'
    },
    {
      name: 'cp',
      syntax: 'cp [options] source destination',
      category: 'Files',
      descriptionEn: 'Copy files and directories',
      descriptionTa: 'கோப்புகள் அல்லது கோப்புறைகளைப் பிரதியெடுக்கும்',
      example: 'cp -r src/ dist/',
      explanationEn: 'Copies the entire "src" folder recursively (-r) to the "dist" directory.',
      explanationTa: 'முழு "src" கோப்புறையையும் அதிலுள்ள கோப்புகளுடன் சேர்த்து "dist" கோப்புறைக்குள் நகலெடுக்கிறது.'
    },
    {
      name: 'mv',
      syntax: 'mv source destination',
      category: 'Files',
      descriptionEn: 'Move or rename files and directories',
      descriptionTa: 'கோப்பை நகர்த்தும் அல்லது பெயர் மாற்றும்',
      example: 'mv old.txt new.txt',
      explanationEn: 'Renames a file from "old.txt" to "new.txt" without copying.',
      explanationTa: 'கோப்பின் பெயரை "old.txt"-லிருந்து "new.txt" என மாற்றுகிறது.'
    },
    {
      name: 'rm',
      syntax: 'rm [options] file',
      category: 'Files',
      descriptionEn: 'Remove files or directories',
      descriptionTa: 'கோப்பு அல்லது கோப்புறையை நீக்கும்',
      example: 'rm -rf node_modules/',
      explanationEn: 'Forcibly (-f) and recursively (-r) removes the node_modules folder. Be very careful!',
      explanationTa: 'கோப்புறையையும் அதிலுள்ள அனைத்தையும் கட்டாயமாக நீக்குகிறது. எச்சரிக்கையுடன் பயன்படுத்தவும்!'
    },
    {
      name: 'cat',
      syntax: 'cat [file]',
      category: 'Files',
      descriptionEn: 'Concatenate and display file content',
      descriptionTa: 'கோப்பின் உள்ளடக்கங்களை திரையில் காட்டும்',
      example: 'cat package.json',
      explanationEn: 'Prints the entire text contents of package.json directly into the terminal screen.',
      explanationTa: 'package.json கோப்பிலுள்ள உரையைத் திரையில் அச்சிடுகிறது.'
    },

    // System
    {
      name: 'uname',
      syntax: 'uname [options]',
      category: 'System',
      descriptionEn: 'Print system information',
      descriptionTa: 'கணினி அமைப்பின் விபரங்களைக் காட்டும்',
      example: 'uname -a',
      explanationEn: 'Prints all system configuration parameters, including kernel release and OS type.',
      explanationTa: 'லினக்ஸ் கர்னல் மற்றும் இயங்குதளத்தின் முழு விவரங்களையும் காட்டுகிறது.'
    },
    {
      name: 'neofetch',
      syntax: 'neofetch',
      category: 'System',
      descriptionEn: 'Display system specs in visual ASCII layout',
      descriptionTa: 'சாதன விபரங்களை அழகிய வடிவில் காட்டும்',
      example: 'neofetch',
      explanationEn: 'Prints hardware, OS version, shell information, uptime, and desktop layout inside the CLI.',
      explanationTa: 'கைபேசியின் வன்பொருள் மற்றும் மென்பொருள் தகவலை ASCII வடிவில் காட்டுகிறது.'
    },
    {
      name: 'df',
      syntax: 'df [options]',
      category: 'System',
      descriptionEn: 'Report file system disk space usage',
      descriptionTa: 'மெமரி இட அளவுப் பயன்பாட்டைக் காட்டும்',
      example: 'df -h',
      explanationEn: 'Shows disk partition sizes and usage space in human-readable (-h) formats (MB/GB).',
      explanationTa: 'பயன்படுத்தப்பட்ட மற்றும் காலியாக உள்ள மெமரி அளவை எளிதில் புரியும்படி (GB/MB) காட்டுகிறது.'
    },
    {
      name: 'free',
      syntax: 'free [options]',
      category: 'System',
      descriptionEn: 'Display amount of free and used memory in system',
      descriptionTa: 'ரேம் (RAM) பயன்படுத்தும் அளவைக் காட்டும்',
      example: 'free -m',
      explanationEn: 'Shows system RAM usage stats, showing total, used, and free slots in Megabytes (-m).',
      explanationTa: 'கணினியின் ரேம் பயன்பாட்டு அளவை மெகாபைட்டில் (MB) காட்டுகிறது.'
    },
    {
      name: 'history',
      syntax: 'history',
      category: 'System',
      descriptionEn: 'Show command history list',
      descriptionTa: 'முன்பு இயக்கிய கட்டளைகளின் வரலாற்றைக் காட்டும்',
      example: 'history',
      explanationEn: 'Lists all recently executed bash command codes with line numbers.',
      explanationTa: 'நீங்கள் கடைசியாகப் பயன்படுத்திய கட்டளைகளின் வரிசையைக் காட்டுகிறது.'
    },

    // Processes
    {
      name: 'ps',
      syntax: 'ps [options]',
      category: 'Processes',
      descriptionEn: 'Report a snapshot of current processes',
      descriptionTa: 'இயங்கும் செயலிகளின் விவரங்களைக் காட்டும்',
      example: 'ps aux',
      explanationEn: 'Lists all currently running processes in the system across all users with CPU/Memory usage details.',
      explanationTa: 'இயங்கும் அனைத்து செயலிகள் மற்றும் அவற்றின் மெமரி பயன்பாட்டை விவரிக்கும்.'
    },
    {
      name: 'top',
      syntax: 'top',
      category: 'Processes',
      descriptionEn: 'Display Linux processes dynamically',
      descriptionTa: 'நிகழ்நேர செயலிகளின் பயன்பாட்டைத் திரையிடும்',
      example: 'top',
      explanationEn: 'Launches an interactive, live-updating command dashboard displaying process activities.',
      explanationTa: 'நிகழ்நேரத்தில் இயங்கும் செயலிகளின் பயன்பாட்டைத் தொடர்ந்து காட்டும் திரை.'
    },
    {
      name: 'kill',
      syntax: 'kill [options] PID',
      category: 'Processes',
      descriptionEn: 'Send a signal to a process (usually to stop it)',
      descriptionTa: 'செயலியை அதன் ஐடி (PID) கொண்டு நிறுத்தும்',
      example: 'kill -9 1234',
      explanationEn: 'Sends a SIGKILL (-9) command to process with ID 1234, forcing it to close immediately.',
      explanationTa: '1234 என்ற எண் கொண்ட செயலியை உடனடியாக மூடுமாறு கட்டாயப்படுத்துகிறது.'
    },

    // Network
    {
      name: 'ping',
      syntax: 'ping [options] destination',
      category: 'Network',
      descriptionEn: 'Send ICMP ECHO_REQUEST to network hosts',
      descriptionTa: 'இணைய இணைப்பு சரியாக உள்ளதா எனச் சோதிக்கும்',
      example: 'ping google.com',
      explanationEn: 'Sends data packets to check the network host latency connection to google.com.',
      explanationTa: 'google.com உடன் இணைய வேகம் மற்றும் தொடர்பு துல்லியமாக உள்ளதா என்பதைச் சோதிக்கும்.'
    },
    {
      name: 'curl',
      syntax: 'curl [options] url',
      category: 'Network',
      descriptionEn: 'Transfer data from or to a server',
      descriptionTa: 'இணைய இணைப்பிலிருந்து தரவுகளைப் பெறும்',
      example: 'curl -I https://pravintamilan.com',
      explanationEn: 'Fetches the HTTP header response info (-I) from the target URL website.',
      explanationTa: 'குறிப்பிட்ட இணைய முகவரியின் தலைப்புத் தகவல்களை (Headers) மட்டும் எடுத்துக்கொண்டு வரும்.'
    },
    {
      name: 'wget',
      syntax: 'wget [options] url',
      category: 'Network',
      descriptionEn: 'Non-interactive network downloader',
      descriptionTa: 'இணைய முகவரியிலிருந்து கோப்பைத் தரவிறக்கும்',
      example: 'wget https://example.com/file.zip',
      explanationEn: 'Downloads a file directly from example.com URL background server to local phone storage.',
      explanationTa: 'இணையத்தில் உள்ள கோப்புகளை உங்கள் சேமிப்பகத்திற்கு நேரடியாகப் பதிவிறக்குகிறது.'
    },

    // Permissions
    {
      name: 'chmod',
      syntax: 'chmod [permissions] file',
      category: 'Permissions',
      descriptionEn: 'Change file mode bits (permissions)',
      descriptionTa: 'கோப்பிற்கான அணுகல் அனுமதிகளை மாற்றும்',
      example: 'chmod +x deploy.sh',
      explanationEn: 'Grants execute permissions (+x) to the deploy.sh file, enabling it to run as a script.',
      explanationTa: 'deploy.sh கோப்பை ஒரு ஸ்கிரிப்ட் போல இயக்குவதற்கான அனுமதியை (+x) வழங்குகிறது.'
    },
    {
      name: 'chown',
      syntax: 'chown [owner][:[group]] file',
      category: 'Permissions',
      descriptionEn: 'Change file owner and group',
      descriptionTa: 'கோப்பின் உரிமையாளரை மாற்றும்',
      example: 'chown root:root backup.tar',
      explanationEn: 'Reassigns file ownership owner and group permissions to root user.',
      explanationTa: 'backup.tar கோப்பின் உரிமையாளர் உரிமைகளை root பயனருக்கு மாற்றுகிறது.'
    },
    {
      name: 'sudo',
      syntax: 'sudo command',
      category: 'Permissions',
      descriptionEn: 'Execute a command as superuser',
      descriptionTa: 'நிர்வாகி (Superuser) அதிகாரத்துடன் இயக்கும்',
      example: 'sudo apt update',
      explanationEn: 'Runs the package list update command with administrator privileges.',
      explanationTa: 'நிர்வாகி அனுமதியுடன் பேக்கேஜ்களைப் புதுப்பிக்கும் கட்டளையை இயக்குகிறது.'
    }
  ];

  filteredCommands: CommandItem[] = [];

  constructor() {
    this.seo.updateMetaTags({
      title: 'Learn Linux & Termux Commands Cheatsheet | Pravin Tamilan',
      description: 'Master core Linux terminal commands. Filter by categories, learn syntax, and test commands instantly in our interactive CLI terminal simulator.',
      url: 'https://pravintamilan.com/linux'
    });
  }

  ngOnInit(): void {
    this.filterCommands();
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }

  // Filter commands by search query and active category
  filterCommands(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredCommands = this.commandsList.filter(cmd => {
      const categoryMatch = this.activeCategory === 'All' || cmd.category === this.activeCategory;
      const textMatch = !query ||
                        cmd.name.toLowerCase().includes(query) ||
                        cmd.descriptionEn.toLowerCase().includes(query) ||
                        cmd.descriptionTa.toLowerCase().includes(query) ||
                        cmd.explanationEn.toLowerCase().includes(query) ||
                        cmd.explanationTa.toLowerCase().includes(query);

      return categoryMatch && textMatch;
    });
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.filterCommands();
  }

  // Copy example to clipboard
  copyToClipboard(cmd: CommandItem): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cmd.example).then(() => {
        this.copiedCommandName = cmd.name;
        setTimeout(() => {
          this.copiedCommandName = '';
        }, 1500);
      });
    }
  }

  // Redirect to terminal simulator pre-loaded with command run
  tryInTerminal(cmd: CommandItem): void {
    this.router.navigate(['/terminal'], { queryParams: { run: cmd.example } });
  }
}
