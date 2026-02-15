from rest_framework import serializers
from .models import Employee, Attendance
from django.core.validators import EmailValidator

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'id', 'updated_at']

    def validate_employee_id(self, value):
        if Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already exists.")
        return value

    def validate_email(self, value):
        if Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(write_only=True)
    employee_name = serializers.CharField(read_only=True, source='employee.full_name')
    employee_department = serializers.CharField(read_only=True, source='employee.department')

    class Meta:
        model = Attendance
        fields = ['id', 'employee_id', 'employee_name', 'employee_department', 'date', 'status', 'marked_at']
        read_only_fields = ['id', 'employee_name', 'employee_department', 'marked_at']

    def validate(self, data):
        """
        Validate the attendance data before creation.
        """
        employee_id = data.get('employee_id')
        
        # Validate employee_id exists
        if not employee_id:
            raise serializers.ValidationError({
                "employee_id": "Employee ID is required."
            })
        
        # Check if employee exists
        try:
            employee = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            raise serializers.ValidationError({
                "employee_id": f"Employee with ID '{employee_id}' does not exist."
            })
        
        # Check for duplicate attendance
        date = data.get('date')
        if date and Attendance.objects.filter(employee=employee, date=date).exists():
            raise serializers.ValidationError({
                "date": f"Attendance already marked for {date}"
            })
        
        # Store employee in context for create method
        self.context['employee'] = employee
        return data

    def create(self, validated_data):
        """
        Create attendance record after validation has passed.
        """
        # Get employee from context (set in validate method)
        employee = self.context.get('employee')
        
        # Remove employee_id as it's not a model field
        validated_data.pop('employee_id', None)
        
        # Create attendance record
        return Attendance.objects.create(employee=employee, **validated_data)

class AttendanceListSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name')
    employee_id = serializers.CharField(source='employee.employee_id')
    employee_department = serializers.CharField(source='employee.department')

    class Meta:
        model = Attendance
        fields = ['id', 'employee_id', 'employee_name', 'employee_department', 'date', 'status', 'marked_at']