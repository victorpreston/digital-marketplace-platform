import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * Email validation with more comprehensive rules
   */
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(control.value);
    
    return isValid ? null : { 
      email: { 
        message: 'Please enter a valid email address',
        actualValue: control.value 
      } 
    };
  }

  /**
   * Phone number validation (supports multiple formats)
   */
  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanNumber = control.value.replace(/[\s\-\(\)]/g, '');
    const isValid = phoneRegex.test(cleanNumber);
    
    return isValid ? null : { 
      phone: { 
        message: 'Please enter a valid phone number',
        actualValue: control.value 
      } 
    };
  }

  /**
   * Strong password validation
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const password = control.value;
    const errors: any = {};
    
    if (password.length < 8) {
      errors.minLength = 'Password must be at least 8 characters long';
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.uppercase = 'Password must contain at least one uppercase letter';
    }
    
    if (!/[a-z]/.test(password)) {
      errors.lowercase = 'Password must contain at least one lowercase letter';
    }
    
    if (!/[0-9]/.test(password)) {
      errors.number = 'Password must contain at least one number';
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.special = 'Password must contain at least one special character';
    }
    
    if (/(.)\1{2,}/.test(password)) {
      errors.repeated = 'Password cannot contain more than 2 consecutive identical characters';
    }
    
    const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.common = 'Password is too common';
    }
    
    return Object.keys(errors).length > 0 ? { strongPassword: errors } : null;
  }

  /**
   * Password confirmation validation
   */
  static passwordMatch(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.get(passwordControlName);
      const confirmPasswordControl = control.get(confirmPasswordControlName);
      
      if (!passwordControl || !confirmPasswordControl) return null;
      
      if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMatch']) {
        return null;
      }
      
      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ 
          passwordMatch: { 
            message: 'Passwords do not match' 
          } 
        });
        return { passwordMatch: true };
      } else {
        if (confirmPasswordControl.errors) {
          delete confirmPasswordControl.errors['passwordMatch'];
          if (Object.keys(confirmPasswordControl.errors).length === 0) {
            confirmPasswordControl.setErrors(null);
          }
        }
        return null;
      }
    };
  }

  /**
   * Credit card number validation
   */
  static creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const cardNumber = control.value.replace(/\s/g, '');
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const isValid = (sum % 10) === 0 && cardNumber.length >= 13 && cardNumber.length <= 19;
    
    if (!isValid) {
      return { 
        creditCard: { 
          message: 'Please enter a valid credit card number',
          actualValue: control.value 
        } 
      };
    }
    
    // Detect card type
    const cardType = this.detectCardType(cardNumber);
    return null;
  }

  private static detectCardType(cardNumber: string): string {
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    
    return 'unknown';
  }

  /**
   * CVV validation
   */
  static cvv(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const cvv = control.value.toString();
    const isValid = /^[0-9]{3,4}$/.test(cvv);
    
    return isValid ? null : { 
      cvv: { 
        message: 'CVV must be 3 or 4 digits',
        actualValue: control.value 
      } 
    };
  }

  /**
   * Expiry date validation (MM/YY format)
   */
  static expiryDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const match = control.value.match(expiryRegex);
    
    if (!match) {
      return { 
        expiryDate: { 
          message: 'Expiry date must be in MM/YY format',
          actualValue: control.value 
        } 
      };
    }
    
    const month = parseInt(match[1], 10);
    const year = 2000 + parseInt(match[2], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { 
        expiryDate: { 
          message: 'Card has expired',
          actualValue: control.value 
        } 
      };
    }
    
    if (year > currentYear + 20) {
      return { 
        expiryDate: { 
          message: 'Expiry date seems too far in the future',
          actualValue: control.value 
        } 
      };
    }
    
    return null;
  }

  /**
   * URL validation
   */
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    try {
      new URL(control.value);
      return null;
    } catch {
      return { 
        url: { 
          message: 'Please enter a valid URL',
          actualValue: control.value 
        } 
      };
    }
  }

  /**
   * File size validation
   */
  static fileSize(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file || !(file instanceof File)) return null;
      
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size > maxSizeInBytes) {
        return { 
          fileSize: { 
            message: `File size must be less than ${maxSizeInMB}MB`,
            maxSize: maxSizeInMB,
            actualSize: Math.round(file.size / 1024 / 1024 * 100) / 100
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * File type validation
   */
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (!file || !(file instanceof File)) return null;
      
      const fileType = file.type.toLowerCase();
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });
      
      if (!isAllowed) {
        return { 
          fileType: { 
            message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
            allowedTypes,
            actualType: file.type
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Minimum age validation
   */
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;
      
      if (actualAge < minAge) {
        return { 
          minAge: { 
            message: `You must be at least ${minAge} years old`,
            requiredAge: minAge,
            actualAge
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Username validation (alphanumeric with underscores and hyphens)
   */
  static username(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    if (!usernameRegex.test(control.value)) {
      return { 
        username: { 
          message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
          actualValue: control.value 
        } 
      };
    }
    
    // Check for reserved usernames
    const reservedUsernames = ['admin', 'root', 'user', 'test', 'null', 'undefined'];
    if (reservedUsernames.includes(control.value.toLowerCase())) {
      return { 
        username: { 
          message: 'This username is reserved',
          actualValue: control.value 
        } 
      };
    }
    
    return null;
  }

  /**
   * Postal code validation (supports multiple countries)
   */
  static postalCode(country?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const patterns: { [key: string]: RegExp } = {
        US: /^\d{5}(-\d{4})?$/,
        CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
        UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
        DE: /^\d{5}$/,
        FR: /^\d{5}$/,
        AU: /^\d{4}$/,
        JP: /^\d{3}-\d{4}$/
      };
      
      const pattern = country ? patterns[country.toUpperCase()] : null;
      
      if (pattern && !pattern.test(control.value)) {
        return { 
          postalCode: { 
            message: `Invalid postal code for ${country}`,
            actualValue: control.value 
          } 
        };
      }
      
      // Generic validation if no country specified
      if (!pattern && !/^[A-Za-z0-9\s-]{3,10}$/.test(control.value)) {
        return { 
          postalCode: { 
            message: 'Please enter a valid postal code',
            actualValue: control.value 
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * JSON validation
   */
  static json(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    try {
      JSON.parse(control.value);
      return null;
    } catch (error) {
      return { 
        json: { 
          message: 'Please enter valid JSON',
          error: (error as Error).message
        } 
      };
    }
  }

  /**
   * Whitespace validation (no leading/trailing whitespace)
   */
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const hasWhitespace = control.value !== control.value.trim();
    
    return hasWhitespace ? { 
      noWhitespace: { 
        message: 'Value cannot have leading or trailing whitespace' 
      } 
    } : null;
  }

  /**
   * Unique values in array validation
   */
  static uniqueArray(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !Array.isArray(control.value)) return null;
    
    const duplicates = control.value.filter((item: any, index: number) => 
      control.value.indexOf(item) !== index
    );
    
    if (duplicates.length > 0) {
      return { 
        uniqueArray: { 
          message: 'Array contains duplicate values',
          duplicates
        } 
      };
    }
    
    return null;
  }

  /**
   * Custom regex validation with error message
   */
  static pattern(regex: RegExp, message: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (!regex.test(control.value)) {
        return { 
          pattern: { 
            message,
            actualValue: control.value,
            requiredPattern: regex.toString()
          } 
        };
      }
      
      return null;
    };
  }

  /**
   * Async email uniqueness validation (mock implementation)
   */
  static uniqueEmail() {
    return (control: AbstractControl) => {
      if (!control.value) return Promise.resolve(null);
      
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock check - in real app, this would call an API
          const takenEmails = ['admin@example.com', 'test@example.com'];
          const isTaken = takenEmails.includes(control.value);
          
          resolve(isTaken ? { 
            uniqueEmail: { 
              message: 'This email address is already taken' 
            } 
          } : null);
        }, 1000);
      });
    };
  }

  /**
   * Dynamic validation based on other field values
   */
  static conditionalValidator(
    condition: (control: AbstractControl) => boolean,
    validator: ValidatorFn
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!condition(control)) {
        return null;
      }
      return validator(control);
    };
  }

  /**
   * Price validation (positive number with up to 2 decimal places)
   */
  static price(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const price = parseFloat(control.value);
    
    if (isNaN(price)) {
      return { 
        price: { 
          message: 'Please enter a valid price' 
        } 
      };
    }
    
    if (price < 0) {
      return { 
        price: { 
          message: 'Price cannot be negative' 
        } 
      };
    }
    
    if (price > 999999.99) {
      return { 
        price: { 
          message: 'Price cannot exceed $999,999.99' 
        } 
      };
    }
    
    // Check decimal places
    const decimalPlaces = (control.value.toString().split('.')[1] || []).length;
    if (decimalPlaces > 2) {
      return { 
        price: { 
          message: 'Price can have at most 2 decimal places' 
        } 
      };
    }
    
    return null;
  }

  /**
   * Stock quantity validation
   */
  static stockQuantity(control: AbstractControl): ValidationErrors | null {
    if (!control.value && control.value !== 0) return null;
    
    const quantity = parseInt(control.value, 10);
    
    if (isNaN(quantity)) {
      return { 
        stockQuantity: { 
          message: 'Please enter a valid quantity' 
        } 
      };
    }
    
    if (quantity < 0) {
      return { 
        stockQuantity: { 
          message: 'Quantity cannot be negative' 
        } 
      };
    }
    
    if (quantity > 10000) {
      return { 
        stockQuantity: { 
          message: 'Quantity cannot exceed 10,000' 
        } 
      };
    }
    
    return null;
  }
}